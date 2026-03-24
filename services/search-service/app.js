const express = require('express');
const { Client } = require('@elastic/elasticsearch');

const app = express();
const port = 3000;

// Setup Elasticsearch client
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

app.get('/search', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    let queryBody = {};
    if (q === '*') {
        queryBody = { match_all: {} };
    } else {
        queryBody = {
            multi_match: {
                query: q,
                fields: ['name^3', 'description'],
                fuzziness: 'AUTO'
            }
        };
    }

    try {
        const result = await esClient.search({
            index: 'products',
            body: {
                query: queryBody
            }
        });

        const products = result.body.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source,
            score: hit._score
        }));

        res.json({
            count: products.length,
            results: products
        });
    } catch (error) {
        console.error('Elasticsearch error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});



app.listen(port, () => {
    console.log(`Search service listening at http://localhost:${port}`);
});
