import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

export { esClient };
