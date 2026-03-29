const express = require('express');
const amqp = require('amqplib');
const { Client } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
const port = 3001;

// Configs
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DB_URL = process.env.DB_URL || 'postgres://user:password@postgres:5432/orders_db';

// Connections
let channel;
const redisClient = redis.createClient({ url: REDIS_URL });
const pgClient = new Client({ connectionString: DB_URL });

// --- Lua Scripts for Atomic Operations ---
const RESERVE_SCRIPT = `
    local stock = tonumber(redis.call('get', KEYS[1]))
    local qty = tonumber(ARGV[1])
    if stock and stock >= qty then
        redis.call('decrby', KEYS[1], qty)
        redis.call('setex', KEYS[2], ARGV[2], qty)
        return 1
    else
        return 0
    end
`;

const ROLLBACK_SCRIPT = `
    local resQty = redis.call('get', KEYS[2])
    if resQty then
        redis.call('incrby', KEYS[1], resQty)
        redis.call('del', KEYS[2])
        return 1
    end
    return 0
`;

async function init() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        // Same exchange as indexer listens to
        await channel.assertExchange('order_events', 'fanout', { durable: true });

        await redisClient.connect();
        await pgClient.connect();
        console.log('Order Service: Connected to RabbitMQ, Redis, and Postgres');

        // Sync stock from product_variants into Redis (setNX = only if not exists)
        const result = await pgClient.query('SELECT id, stock_quantity FROM product_variants');
        for (const variant of result.rows) {
            await redisClient.setNX(`stock:${variant.id}`, variant.stock_quantity.toString());
        }
        console.log(`Order Service: Synced ${result.rows.length} variants stock to Redis`);
    } catch (err) {
        console.error('Order Service init failed:', err.message);
        process.exit(1);
    }
}

app.get('/', (req, res) => res.send('Order Service is up'));

// GET order status — dùng để poll sau khi đặt hàng
app.get('/order/:id', async (req, res) => {
    try {
        const result = await pgClient.query(
            `SELECT o.id, o.status, o.total_amount, o.created_at,
                    json_agg(json_build_object(
                        'variantId', oi.variant_id,
                        'quantity', oi.quantity,
                        'price', oi.price_at_purchase
                    )) as items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.id = $1
             GROUP BY o.id`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /order — đặt hàng
// Body: { variantId, quantity, productId, productName }
app.post('/order', async (req, res) => {
    console.log(`[ORDER] POST /order: ${JSON.stringify(req.body)}`);
    const { variantId, quantity, productId, productName } = req.body;

    if (!variantId || !quantity) {
        return res.status(400).json({ error: 'variantId and quantity are required' });
    }

    const tempOrderId = `tmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stockKey = `stock:${variantId}`;
    const resKey = `res:${tempOrderId}`;

    try {
        // 1. Lấy giá từ DB
        const variantRes = await pgClient.query(
            'SELECT price, stock_quantity FROM product_variants WHERE id = $1',
            [variantId]
        );
        if (variantRes.rows.length === 0) {
            return res.status(404).json({ error: 'Biến thể sản phẩm không tồn tại' });
        }
        const { price } = variantRes.rows[0];
        const totalAmount = parseFloat(price) * parseInt(quantity);

        // 2. Atomic Stock Reservation in Redis (Lua, 15 phút TTL)
        const reserveResult = await redisClient.eval(RESERVE_SCRIPT, {
            keys: [stockKey, resKey],
            arguments: [quantity.toString(), '900']
        });

        if (reserveResult !== 1) {
            console.warn(`[ORDER] Hết hàng cho variant ${variantId}`);
            return res.status(400).json({ error: 'Hết hàng hoặc không đủ số lượng' });
        }

        // 3. Lưu đơn PENDING vào Postgres
        let orderId;
        try {
            await pgClient.query('BEGIN');
            const orderRes = await pgClient.query(
                'INSERT INTO orders (status, total_amount) VALUES ($1, $2) RETURNING id',
                ['PENDING', totalAmount]
            );
            orderId = orderRes.rows[0].id;

            await pgClient.query(
                'INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [orderId, variantId, quantity, price]
            );
            await pgClient.query('COMMIT');
            await redisClient.del(resKey); // Xóa temp reservation

        } catch (dbErr) {
            console.error('[DB FAIL] Rolling back Redis...', dbErr.message);
            await pgClient.query('ROLLBACK').catch(() => {});
            await redisClient.eval(ROLLBACK_SCRIPT, { keys: [stockKey, resKey] });
            return res.status(500).json({ error: 'Failed to create order. Stock restored.' });
        }

        // 4. Bắn sự kiện ORDER_PLACED vào RabbitMQ → Indexer xử lý
        const event = {
            type: 'ORDER_PLACED',
            orderId,
            variantId,
            productId: productId || null,
            productName: productName || 'Unknown',
            quantity: parseInt(quantity),
            totalAmount,
            timestamp: new Date().toISOString()
        };
        console.log(`[ORDER] Publishing ORDER_PLACED for Order ${orderId}...`);
        channel.publish('order_events', '', Buffer.from(JSON.stringify(event)));
        console.log(`[ORDER] Event published ✓`);

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            orderId,
            totalAmount,
            status: 'PENDING'
        });
    } catch (err) {
        console.error('[ORDER ERROR]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Order Service listening at http://localhost:${port}`);
    init();
});
