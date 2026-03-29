const amqp = require('amqplib');
const { Client: ESClient } = require('@elastic/elasticsearch');
const { Client: PGClient } = require('pg');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const POSTGRES_URL = process.env.POSTGRES_URL || 'postgres://user:password@postgres:5432/orders_db';

const esClient = new ESClient({ node: ELASTICSEARCH_URL });
const pgClient = new PGClient({ connectionString: POSTGRES_URL });

const EXCHANGE_NAME = 'events';
const SYNC_QUEUE = 'events_sync_queue';
const DLX_NAME = 'events_dlx';
const DLQ_NAME = 'events_dlq';

async function initElasticsearch() {
    console.log(`[INIT] Starting ES check...`);
    
    try {
        // --- 1. Products Index ---
        const indexName = 'products';
        const existsRes = await esClient.indices.exists({ index: indexName });
        const exists = existsRes.body;
        console.log(`[INIT] Index '${indexName}' exists: ${exists}`);

        if (!exists) {
            console.log(`[INIT] Creating '${indexName}'...`);
            await esClient.indices.create({
                index: indexName,
                body: {
                    settings: {
                        analysis: {
                            filter: { ngram_filter: { type: 'edge_ngram', min_gram: 2, max_gram: 20 } },
                            analyzer: { ngram_analyzer: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'ngram_filter'] } }
                        }
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: { type: 'text', analyzer: 'ngram_analyzer', search_analyzer: 'standard' },
                            slug: { type: 'keyword' },
                            description: { type: 'text', analyzer: 'ngram_analyzer', search_analyzer: 'standard' },
                            price: { type: 'float' },
                            stock: { type: 'integer' },
                            category: { type: 'keyword' },
                            categoryId: { type: 'keyword' },
                            image: { type: 'keyword' },
                            createdAt: { type: 'date' }
                        }
                    }
                }
            });

            const result = await pgClient.query(`
                SELECT 
                    p.id, p.name, p.slug, p.description, p.category_id as "categoryId",
                    p.created_at as "createdAt",
                    c.name as category,
                    MIN(v.price) as price,
                    SUM(v.stock_quantity) as stock,
                    (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) as image
                FROM products p
                LEFT JOIN product_variants v ON p.id = v.product_id
                LEFT JOIN categories c ON p.category_id = c.id
                GROUP BY p.id, p.name, p.slug, p.description, p.category_id, p.created_at, c.name
            `);
            
            console.log(`[INIT] Syncing ${result.rows.length} products...`);
            for (const p of result.rows) {
                await esClient.index({ index: indexName, id: p.id, body: p });
            }
        }

        // --- 2. Categories Index ---
        const categoriesIndex = 'categories';
        const catExistsRes = await esClient.indices.exists({ index: categoriesIndex });
        const catExists = catExistsRes.body;
        console.log(`[INIT] Index '${categoriesIndex}' exists: ${catExists}`);

        if (!catExists) {
            console.log(`[INIT] Creating '${categoriesIndex}'...`);
            await esClient.indices.create({
                index: categoriesIndex,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: { type: 'text' },
                            slug: { type: 'keyword' },
                            imageUrl: { type: 'keyword' },
                            parentId: { type: 'keyword' },
                            description: { type: 'text' }
                        }
                    }
                }
            });

            console.log(`[INIT] Fetching categories from Postgres...`);
            const catResult = await pgClient.query(`SELECT id, name, slug, parent_id as "parentId", image_url as "imageUrl", description FROM categories`);
            console.log(`[INIT] Syncing ${catResult.rows.length} categories...`);
            for (const c of catResult.rows) {
                await esClient.index({ index: categoriesIndex, id: c.id, body: c });
            }
        }

        // --- 3. Audit Index ---
        const auditIndex = 'order_audit';
        const auditExistsRes = await esClient.indices.exists({ index: auditIndex });
        if (!auditExistsRes.body) {
            await esClient.indices.create({ index: auditIndex });
        }
        
        console.log(`[INIT] ALL OK.`);
    } catch (err) {
        console.error(`[INIT ERROR]`, err);
        throw err;
    }
}

async function startWorker() {
    console.log('Indexer Worker starting...');
    let connected = false;
    
    while (!connected) {
        try {
            await pgClient.connect().catch(e => { if(!e.message.includes('already connected')) throw e; });
            console.log('Connected to Postgres');
            
            await initElasticsearch();

            const connection = await amqp.connect(RABBITMQ_URL);
            const channel = await connection.createChannel();

            await channel.assertExchange(DLX_NAME, 'fanout', { durable: true });
            await channel.assertQueue(DLQ_NAME, { durable: true });
            await channel.bindQueue(DLQ_NAME, DLX_NAME, '');

            await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
            await channel.assertQueue(SYNC_QUEUE, {
                durable: true,
                arguments: { 'x-dead-letter-exchange': DLX_NAME }
            });
            await channel.bindQueue(SYNC_QUEUE, EXCHANGE_NAME, '');

            console.log('Indexer listening...');

            channel.consume(SYNC_QUEUE, async (msg) => {
                if (!msg) return;
                const event = JSON.parse(msg.content.toString());
                const orderId = event.id;

                try {
                    const { body: alreadyProcessed } = await esClient.exists({ index: 'order_audit', id: orderId });
                    if (alreadyProcessed) return channel.ack(msg);

                    if (event.type === 'ORDER_PLACED') {
                        await pgClient.query('BEGIN');
                        await pgClient.query('UPDATE orders SET status = $1 WHERE id = $2', ['COMPLETED', orderId]);
                        await pgClient.query('UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2', [event.quantity, event.productId]);
                        
                        await esClient.update({
                            index: 'products',
                            id: event.productId,
                            body: { 
                                script: { 
                                    source: "if (ctx._source.stock != null) { ctx._source.stock -= params.qty }", 
                                    params: { qty: event.quantity } 
                                } 
                            }
                        }).catch(e => console.error("ES Update Error:", e.message));

                        await esClient.index({ index: 'order_audit', id: orderId, body: { processed_at: new Date() } });
                        await pgClient.query('COMMIT');
                    }
                    channel.ack(msg);
                } catch (err) {
                    console.error(`[ERROR] Processing Order ${orderId}:`, err.message);
                    await pgClient.query('ROLLBACK').catch(() => {});
                    channel.nack(msg, false, true); 
                }
            });

            connected = true;
        } catch (error) {
            console.error('Worker init failed, retrying in 5s...', error.message);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

startWorker();
