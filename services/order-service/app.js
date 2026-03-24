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

async function init() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange('events', 'fanout', { durable: true });
        
        await redisClient.connect();
        await pgClient.connect();
        console.log('Order Service: Connected to RabbitMQ, Redis, and Postgres');

        console.log('[INIT] Syncing stock from Postgres to Redis...');
        const result = await pgClient.query('SELECT id, stock_quantity FROM product_variants');
        for (const variant of result.rows) {
            const redisKey = `stock:${variant.id}`;
            const exists = await redisClient.exists(redisKey);
            if (!exists) {
                await redisClient.set(redisKey, variant.stock_quantity.toString());
                console.log(`[INIT] Synced stock for ${variant.id}: ${variant.stock_quantity}`);
            }
        }
        console.log('[INIT] Redis stock sync check complete!');
    } catch (err) {
        console.error('Order Service init failed:', err);
        process.exit(1);
    }
}

app.post('/order', async (req, res) => {
    const { productId, quantity } = req.body;

    // 1. Atomic Stock Reservation (Redis)
    const newStock = await redisClient.decrBy(`stock:${productId}`, quantity);
    if (newStock < 0) {
        // Revert if out of stock
        await redisClient.incrBy(`stock:${productId}`, quantity);
        return res.status(400).json({ error: 'Out of stock' });
    }

    // 2. Create Order in DB (Relational)
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
        console.log(`Professional Order recorded: ${orderId}`);
    } catch (dbErr) {
        await pgClient.query('ROLLBACK');
        console.error('DB error:', dbErr);
        await redisClient.incrBy(`stock:${productId}`, quantity);
        return res.status(500).json({ error: 'Failed to create order in DB' });
    }

    // 3. Emit message to RabbitMQ
    const event = {
        type: 'ORDER_PLACED',
        id: orderId,
        productId, // This is actually the variantId
        quantity,
        timestamp: new Date()
    };
    channel.publish('events', '', Buffer.from(JSON.stringify(event)));

    res.status(201).json({ message: 'Order created', orderId });
});



app.listen(port, () => {
    console.log(`Order Service listening at http://localhost:${port}`);
    init();
});
