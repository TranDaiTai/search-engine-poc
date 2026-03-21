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

// Connections (Simplified for demo)
let channel;
const redisClient = redis.createClient({ url: REDIS_URL });

async function init() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange('events', 'fanout', { durable: true });
        
        await redisClient.connect();
        console.log('Order Service: Connected to RabbitMQ and Redis');
    } catch (err) {
        console.error('Order Service init failed:', err);
    }
}

app.post('/order', async (req, res) => {
    const { productId, quantity } = req.body;

    // 1. Stock Reservation (Redis)
    const stock = await redisClient.get(`stock:${productId}`);
    if (parseInt(stock) < quantity) {
        return res.status(400).json({ error: 'Out of stock' });
    }
    await redisClient.decrBy(`stock:${productId}`, quantity);

    // 2. Create Order in DB (Skipping real DB write for Phase 1 demo)
    const orderId = `ord_${Date.now()}`;
    console.log(`Order created: ${orderId} for product ${productId}`);

    // 3. Emit message to RabbitMQ
    const event = {
        type: 'ORDER_PLACED',
        id: orderId,
        productId,
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
