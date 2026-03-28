const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const CircuitBreaker = require('opossum');

const app = express();
const port = 3000;

const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

// --- Circuit Breaker Configuration ---
const breakerOptions = {
    timeout: 200,          // If ES takes > 200ms, it's a failure
    errorThresholdPercentage: 50, 
    resetTimeout: 5000     // Try again after 5s
};

const searchFromES = async (queryBody) => {
    return await esClient.search({
        index: 'products',
        body: { query: queryBody }
    });
};

const breaker = new CircuitBreaker(searchFromES, breakerOptions);

// Fallback logic when ES is down or slow
breaker.fallback(() => {
    console.warn('[CIRCUIT BREAKER] ES is down or slow. Returning fallback results.');
    return {
        body: {
            hits: {
                hits: [
                    { _id: 'fallback-1', _source: { name: 'iPhone 15 Pro (Suggested)', price: 999, category: 'Electronics' } },
                    { _id: 'fallback-2', _source: { name: 'Sony WH-1000XM5 (Suggested)', price: 349, category: 'Accessories' } }
                ]
            }
        }
    };
});

app.get('/search', async (req, res) => {
    const { q, category, minPrice, maxPrice } = req.query;

    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

    // --- 1. Advanced Query DSL with Boosting & Fuzziness ---
    let queryBody = {
        bool: {
            must: q === '*' ? [{ match_all: {} }] : [
                {
                    multi_match: {
                        query: q,
                        fields: ['name^3', 'description', 'category^2'],
                        fuzziness: 'AUTO',
                        prefix_length: 2
                    }
                }
            ],
            filter: [] // 2. Using Filters for performance (caching)
        }
    };

    if (category) {
        queryBody.bool.filter.push({ term: { category: category } });
    }

    if (minPrice || maxPrice) {
        queryBody.bool.filter.push({
            range: {
                price: {
                    gte: minPrice || 0,
                    lte: maxPrice || 999999
                }
            }
        });
    }

    try {
        // --- 3. Execute with Circuit Breaker ---
        const result = await breaker.fire(queryBody);

        const products = result.body.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source,
            score: hit._score || 0
        }));

        res.json({
            source: products[0]?.id.startsWith('fallback') ? 'cache/fallback' : 'elasticsearch',
            count: products.length,
            results: products
        });
    } catch (error) {
        console.error('Search failure:', error.message);
        res.status(500).json({ error: 'Search failed after fallback attempts.' });
    }
});

app.listen(port, () => {
    console.log(`Search service listening at http://localhost:${port}`);
});
