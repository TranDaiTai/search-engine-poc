const amqp = require('amqplib');
const { Client: ESClient } = require('@elastic/elasticsearch');
const { Client: PGClient } = require('pg');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const POSTGRES_URL = process.env.POSTGRES_URL || 'postgres://user:password@postgres:5432/orders_db';

const esClient = new ESClient({ node: ELASTICSEARCH_URL });
const pgClient = new PGClient({ connectionString: POSTGRES_URL });

async function initElasticsearch() {
    try {
        const indexName = 'products';
        const { body: exists } = await esClient.indices.exists({ index: indexName });

        if (!exists) {
            console.log(`[INIT] Index '${indexName}' does not exist. Creating with explicit mapping...`);
            
            // 1. Cấu hình Mapping Chuẩn Chỉ (Professional Explicit Mapping)
            await esClient.indices.create({
                index: indexName,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: { type: 'text', analyzer: 'standard' },
                            description: { type: 'text' },
                            price: { type: 'float' },
                            stock: { type: 'integer' },
                            category: { type: 'keyword' },
                            sku: { type: 'keyword' }
                        }
                    }
                }
            });

            console.log(`[INIT] Mapping created. Fetching initial data from PostgreSQL...`);

            // 2. Lấy toàn bộ dữ liệu từ CSDL Gốc
            const result = await pgClient.query(`
                SELECT 
                    v.id, v.sku, v.price, v.stock_quantity as stock,
                    p.name, p.description,
                    c.name as category
                FROM product_variants v
                JOIN products p ON v.product_id = p.id
                JOIN categories c ON p.category_id = c.id
            `);

            const products = result.rows;
            console.log(`[INIT] Found ${products.length} product variants in DB. Indexing to ES...`);

            // 3. Đẩy dữ liệu vào ES (Bulk Insert)
            for (const p of products) {
                await esClient.index({
                    index: indexName,
                    id: p.id,
                    body: {
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        stock: p.stock,
                        category: p.category,
                        sku: p.sku
                    }
                });
            }
            console.log(`[INIT] Synchronized all DB data to Elasticsearch successfully!`);
        } else {
            console.log(`[INIT] Index '${indexName}' already exists. Skipping initial sync.`);
        }
    } catch (err) {
        console.error('[INIT] Error during ES initialization:', err);
    }
}

async function startWorker() {
    try {
        await pgClient.connect();
        
        // Auto-migrate and sync data from Postgres to ES on startup
        await initElasticsearch();
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange('events', 'fanout', { durable: true });
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, 'events', '');

        console.log('Indexer Worker listening for real time events...');

        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    
                    if (event.type === 'ORDER_PLACED') {
                        console.log(`Processing Order Event: ${event.id} for product ${event.productId}`);
                        
                        // 1. Update PG Order Status to COMPLETED
                        await pgClient.query(
                            'UPDATE orders SET status = $1 WHERE id = $2',
                            ['COMPLETED', event.id]
                        );
                        
                        // 2. Sync Stock decrement to DB (product_variants)
                        await pgClient.query(
                            'UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                            [event.quantity, event.productId]
                        );
                        
                        // 3. Sync Stock decrement to Elasticsearch
                        await esClient.update({
                            index: 'products',
                            id: event.productId.toString(), // Document ID là Variant ID
                            body: {
                                script: {
                                    source: "ctx._source.stock -= params.qty",
                                    params: { qty: event.quantity }
                                }
                            }
                        });

                        console.log(`Successfully Synced: Order ${event.id} -> DB Variant Stock Update -> ES Stock Update.`);
                    }
                } catch (err) {
                    console.error('Error syncing order event payload:', err);
                } finally {
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('Worker init error:', error);
        process.exit(1); // Fail fast so Docker/K8s can reliably restart the pod
    }
}

startWorker();
