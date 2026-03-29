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

const searchFromES = async (queryBody, fromParam, sizeParam) => {
    return await esClient.search({
        index: 'products',
        body: { query: queryBody, from: fromParam, size: sizeParam }
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

/**
 * Executes a suggestions query against ES.
 * Uses the name field which has edge_ngram analyzer.
 */
const getSuggestionsFromES = async (q) => {
    return await esClient.search({
        index: 'products',
        body: {
            size: 8,
            query: {
                match: {
                    name: {
                        query: q,
                        operator: 'and'
                    }
                }
            },
            _source: ['id', 'name', 'slug', 'image', 'price']
        }
    });
};

const suggestionsBreaker = new CircuitBreaker(getSuggestionsFromES, breakerOptions);
suggestionsBreaker.fallback(() => ({ body: { hits: { hits: [] } } }));

app.get('/search/suggestions', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ results: [] });

    console.log(`[SUGGEST] Query: ${q}`);
    try {
        const result = await suggestionsBreaker.fire(q);
        const suggestions = result.body.hits.hits.map(hit => ({
            id: hit._source.id,
            name: hit._source.name,
            slug: hit._source.slug,
            image: hit._source.image,
            price: hit._source.price
        }));

        res.json({ results: suggestions });
    } catch (error) {
        console.error('[SUGGEST] Error:', error.message);
        res.json({ results: [] });
    }
});

app.get('/search', async (req, res) => {
    const { q, category, minPrice, maxPrice, page, limit } = req.query;

    const searchTerm = q || '*';
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '12');
    const from = (pageNum - 1) * limitNum;

    console.log(`[SEARCH] Term: ${searchTerm}, Category: ${category}, Page: ${pageNum}`);

    let queryBody = {
        bool: {
            must: searchTerm === '*' ? [{ match_all: {} }] : [
                {
                    multi_match: {
                        query: searchTerm,
                        fields: ['name^3', 'description', 'category^2'],
                        fuzziness: 'AUTO'
                    }
                }
            ],
            filter: []
        }
    };

    if (category) {
        queryBody.bool.filter.push({ term: { categoryId: category } });
    }

    if (minPrice || maxPrice) {
        queryBody.bool.filter.push({
            range: {
                price: {
                    gte: minPrice ? parseFloat(minPrice) : 0,
                    lte: maxPrice ? parseFloat(maxPrice) : 999999
                }
            }
        });
    }

    try {
        const result = await breaker.fire(queryBody, from, limitNum);
        
        const totalItems = result.body.hits.total.value;
        const totalPages = Math.ceil(totalItems / limitNum);

        const products = result.body.hits.hits.map(hit => {
            const minPriceVal = parseFloat(hit._source.price) || 0;
            return {
                id: hit._id,
                name: hit._source.name,
                slug: hit._source.slug,
                description: hit._source.description,
                categoryId: hit._source.categoryId,
                category: { name: hit._source.category },
                price: minPriceVal,
                originalPrice: minPriceVal * 1.2,
                variants: [{ price: minPriceVal }],
                images: hit._source.image ? [{ imageUrl: hit._source.image }] : [],
                score: hit._score || 0
            };
        });

        res.json({
            source: products[0]?.id.startsWith('fallback') ? 'cache/fallback' : 'elasticsearch',
            products: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalItems,
                pages: totalPages
            }
        });
    } catch (error) {
        console.error('[SEARCH] Error:', error.message);
        res.status(500).json({ 
            error: 'Search failed.',
            details: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'search-service' });
});

app.listen(port, () => {
    console.log(`Search service listening at http://localhost:${port}`);
});
