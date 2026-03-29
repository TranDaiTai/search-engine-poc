const amqp = require('amqplib');
const { Client } = require('pg');
const { Client: EsClient } = require('@elastic/elasticsearch');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200';
const POSTGRES_URL = process.env.POSTGRES_URL || 'postgres://user:password@postgres:5432/orders_db';

const EXCHANGE_NAME = 'order_events';
const SYNC_QUEUE = 'search_sync_queue';
const DLQ_NAME = 'search_sync_dlq';
const DLX_NAME = 'order_events_dlx';

const esClient = new EsClient({ node: ELASTICSEARCH_URL });

async function initElasticsearch() {
    console.log('[ELASTIC] Initializing indices...');
    const productIndex = 'products';
    const categoryIndex = 'categories';
    const auditIndex = 'order_audit';

    const indices = [
        { 
            name: productIndex, 
            body: {
                settings: {
                    max_ngram_diff: 13,
                    analysis: {
                        analyzer: {
                            ngram_analyzer: { type: 'custom', tokenizer: 'ngram_tokenizer', filter: ['lowercase'] }
                        },
                        tokenizer: {
                            ngram_tokenizer: { type: 'ngram', min_gram: 2, max_gram: 15, token_chars: ['letter', 'digit'] }
                        }
                    }
                },
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        name: { type: 'text', analyzer: 'ngram_analyzer', search_analyzer: 'standard' },
                        slug: { type: 'keyword' },
                        description: { type: 'text', analyzer: 'ngram_analyzer', search_analyzer: 'standard' },
                        price: { type: 'float' },
                        originalPrice: { type: 'float' },
                        stock: { type: 'integer' },
                        category: { type: 'keyword' },
                        categoryId: { type: 'keyword' },
                        image: { type: 'keyword' },
                        createdAt: { type: 'date' }
                    }
                }
            }
        },
        { 
            name: categoryIndex, 
            body: {
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        name: { type: 'keyword' },
                        slug: { type: 'keyword' },
                        parentId: { type: 'keyword' }
                    }
                }
            }
        },
        { name: auditIndex, body: {} }
    ];

    for (const idx of indices) {
        const { body: exists } = await esClient.indices.exists({ index: idx.name });
        if (!exists) {
            await esClient.indices.create({ index: idx.name, body: idx.body });
            console.log(`[ELASTIC] Created index: ${idx.name}`);
        }
    }
}

async function syncCategories(pgClient) {
    console.log('[SYNC] Categories...');
    const res = await pgClient.query('SELECT id, name, slug, parent_id as "parentId" FROM categories');
    for (const cat of res.rows) {
        await esClient.index({ index: 'categories', id: cat.id, body: cat });
    }
    console.log(`[SYNC] ${res.rows.length} categories synced.`);
}

async function syncProducts(pgClient) {
    console.log('[SYNC] Products...');
    const res = await pgClient.query(`
        SELECT 
            p.id, p.name, p.slug, p.description, 
            p.category_id as "categoryId",
            p.created_at as "createdAt",
            c.name as category,
            COALESCE(MIN(v.price), 0) as price,
            CASE WHEN MIN(v.price) IS NOT NULL THEN (MIN(v.price) * 1.25) ELSE 0 END as "originalPrice",
            COALESCE(SUM(v.stock_quantity), 0) as stock,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) as image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_variants v ON p.id = v.product_id
        GROUP BY p.id, c.name
    `);
    for (const p of res.rows) {
        await esClient.index({ index: 'products', id: p.id, body: p });
    }
    console.log(`[SYNC] ${res.rows.length} products synced.`);
}

async function startWorker() {
    console.log('[INIT] Indexer service starting...');
    const pgClient = new Client({ connectionString: POSTGRES_URL });

    while (true) {
        try {
            await pgClient.connect();
            console.log('[INIT] Postgres connected.');
            break;
        } catch (err) {
            console.error('[INIT] Postgres connection failed, retrying in 5s...', err.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    // Retry until Elasticsearch is ready
    while (true) {
        try {
            await esClient.ping();
            console.log('[INIT] Elasticsearch connected.');
            break;
        } catch (err) {
            console.error('[INIT] Elasticsearch not ready, retrying in 5s...', err.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    try {
        await initElasticsearch();
        await syncCategories(pgClient);
        await syncProducts(pgClient);

        // RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        console.log('[INIT] RabbitMQ connected.');

        await channel.assertExchange(DLX_NAME, 'fanout', { durable: true });
        await channel.assertQueue(DLQ_NAME, { durable: true });
        await channel.bindQueue(DLQ_NAME, DLX_NAME, '');
        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
        await channel.assertQueue(SYNC_QUEUE, { durable: true, arguments: { 'x-dead-letter-exchange': DLX_NAME } });
        await channel.bindQueue(SYNC_QUEUE, EXCHANGE_NAME, '');

        console.log('[INIT] Listening for events...');
        channel.consume(SYNC_QUEUE, async (msg) => {
            if (!msg) return;
            let event;
            try {
                event = JSON.parse(msg.content.toString());
            } catch (e) {
                console.error('[EVENT] Failed to parse message:', e.message);
                channel.nack(msg, false, false); // Gửi vào DLQ
                return;
            }

            console.log(`[EVENT] Received: ${event.type} | Order: ${event.orderId} | Variant: ${event.variantId} | Qty: ${event.quantity}`);

            try {
                if (event.type === 'ORDER_PLACED') {
                    const { orderId, variantId, productId, quantity } = event;

                    // Bước 1: Trừ tồn kho thật trong Postgres
                    const updateRes = await pgClient.query(
                        `UPDATE product_variants
                         SET stock_quantity = GREATEST(0, stock_quantity - $1)
                         WHERE id = $2
                         RETURNING product_id, stock_quantity`,
                        [quantity, variantId]
                    );

                    if (updateRes.rows.length === 0) {
                        console.warn(`[EVENT] Variant ${variantId} not found in Postgres`);
                    } else {
                        const { product_id: pgProductId, stock_quantity: newStock } = updateRes.rows[0];
                        const resolvedProductId = productId || pgProductId;
                        console.log(`[EVENT] Postgres stock updated: variant ${variantId} → ${newStock} remaining`);

                        // Bước 2: Re-sync sản phẩm lên Elasticsearch với tồn kho mới
                        const productRes = await pgClient.query(`
                            SELECT
                                p.id, p.name, p.slug, p.description,
                                p.category_id as "categoryId",
                                p.created_at as "createdAt",
                                c.name as category,
                                COALESCE(MIN(v.price), 0) as price,
                                CASE WHEN MIN(v.price) IS NOT NULL THEN (MIN(v.price) * 1.25) ELSE 0 END as "originalPrice",
                                COALESCE(SUM(v.stock_quantity), 0) as stock,
                                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) as image
                            FROM products p
                            JOIN categories c ON p.category_id = c.id
                            LEFT JOIN product_variants v ON p.id = v.product_id
                            WHERE p.id = $1
                            GROUP BY p.id, c.name
                        `, [resolvedProductId]);

                        if (productRes.rows.length > 0) {
                            await esClient.index({
                                index: 'products',
                                id: resolvedProductId,
                                body: productRes.rows[0]
                            });
                            console.log(`[EVENT] Elasticsearch updated: product ${resolvedProductId} stock = ${productRes.rows[0].stock}`);
                        }
                    }

                    // Bước 3: Chuyển trạng thái đơn hàng → COMPLETED
                    await pgClient.query(
                        `UPDATE orders SET status = 'COMPLETED' WHERE id = $1`,
                        [orderId]
                    );
                    console.log(`[EVENT] Order ${orderId} → COMPLETED ✓`);

                    // Bước 4: Ghi audit log
                    await esClient.index({
                        index: 'order_audit',
                        body: {
                            ...event,
                            processedAt: new Date().toISOString(),
                            status: 'COMPLETED'
                        }
                    });
                }

                channel.ack(msg);
                console.log(`[EVENT] Processed successfully ✓`);

            } catch (err) {
                console.error(`[EVENT] Processing failed:`, err.message);
                channel.nack(msg, false, false); // Gửi vào DLQ, không requeue
            }
        });

    } catch (err) {
        console.error('[FATAL] Workflow Error:', err.message);
        process.exit(1); // Docker will restart it
    }
}

startWorker();
