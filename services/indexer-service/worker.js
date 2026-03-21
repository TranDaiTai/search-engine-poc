const amqp = require('amqplib');
const { Client } = require('@elastic/elasticsearch');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const QUEUE_NAME = 'inventory_updates';

// Setup Elasticsearch client
const esClient = new Client({
    node: ELASTICSEARCH_URL
});

async function startWorker() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log(`Worker started, listening on queue: ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const product = JSON.parse(msg.content.toString());

                console.log(`Processing product: ${product.name}`);

                try {
                    // Index to Elasticsearch
                    await esClient.index({
                        index: 'products',
                        id: product.id,
                        body: {
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            stock: product.stock,
                            updated_at: new Date()
                        }
                    });

                    console.log(`Indexed product to ES: ${product.name}`);
                    channel.ack(msg);
                } catch (esError) {
                    console.error('ES Indexing error:', esError);
                    // Optionally NACK message to retry
                    channel.nack(msg);
                }
            }
        });
    } catch (error) {
        console.error('Worker failed to start:', error);
        // Retry logic for Docker startup
        setTimeout(startWorker, 5000);
    }
}

startWorker();
