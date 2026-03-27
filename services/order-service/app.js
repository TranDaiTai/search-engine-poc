const express = require('express');
const amqp = require('amqplib');
const { Client } = require('pg');
const redis = require('redis');

const app = express();
app.use(express.json());
const port = 3001;

// Configs
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DB_CONFIG = {
    user: 'user',
    host: 'postgres',
    database: 'orders_db',
    password: 'password',
    port: 5432,
};

// Connections
let channel;
const redisClient = redis.createClient({ url: REDIS_URL });
const pgClient = new Client(DB_CONFIG);

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
        await channel.assertExchange('events', 'fanout', { durable: true });
        
        await redisClient.connect();
        await pgClient.connect();
        console.log('Order Service: Connected to RabbitMQ, Redis, and Postgres');

        // Initial Stock Sync (Simplified for demo)
        const result = await pgClient.query('SELECT id, stock_quantity FROM product_variants');
        for (const variant of result.rows) {
            await redisClient.setNX(`stock:${variant.id}`, variant.stock_quantity.toString());
        }
        console.log('Order Service: Initial Stock Sync complete');
    } catch (err) {
        console.error('Order Service init failed:', err);
        process.exit(1);
    }
}

app.get('/', (req, res) => res.send('Order Service is up'));

app.post('/order', async (req, res) => {
    console.log(`[ORDER] POST /order received: ${JSON.stringify(req.body)}`);
    const { productId, quantity } = req.body;
    const tempOrderId = `tmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stockKey = `stock:${productId}`;
    const resKey = `res:${tempOrderId}`;

    try {
        // 1. Atomic Stock Reservation with Lua (15 min TTL)
        const reserveResult = await redisClient.eval(RESERVE_SCRIPT, {
            keys: [stockKey, resKey],
            arguments: [quantity.toString(), '900'] 
        });

        if (reserveResult !== 1) {
            console.warn(`[ORDER] Reservation failed for ${productId}`);
            return res.status(400).json({ error: 'Out of stock or invalid product' });
        }

        // 2. Create Order in DB
        let orderId;
        try {
            await pgClient.query('BEGIN');
            const orderRes = await pgClient.query(
                'INSERT INTO orders (status, total_amount) VALUES ($1, $2) RETURNING id', 
                ['PENDING', 0]
            );
            orderId = orderRes.rows[0].id;

            await pgClient.query(
                'INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [orderId, productId, quantity, 0]
            );
            await pgClient.query('COMMIT');
            
            // Finalize: Remove temp reservation
            await redisClient.del(resKey);
            
        } catch (dbErr) {
            console.error('[DATABASE FAIL] Rolling back Redis reservation...', dbErr.message);
            await pgClient.query('ROLLBACK').catch(() => {});
            
            await redisClient.eval(ROLLBACK_SCRIPT, {
                keys: [stockKey, resKey]
            });

            return res.status(500).json({ error: 'Failed to create order. Stock restored.' });
        }

        // 3. Emit message to RabbitMQ
        const event = {
            type: 'ORDER_PLACED',
            id: orderId,
            productId,
            quantity,
            timestamp: new Date()
        };
        console.log(`[ORDER] Publishing event for Order ${orderId}...`);
        const published = channel.publish('events', '', Buffer.from(JSON.stringify(event)));
        console.log(`[ORDER] Event published: ${published}`);

        res.status(201).json({ message: 'Order created', orderId });
    } catch (err) {
        console.error('[ORDER ERROR]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Order Service listening at http://localhost:${port}`);
    init();
});
