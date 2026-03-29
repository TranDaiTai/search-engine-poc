import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SearchController } from './controllers/search.controller';
import { esClient } from './config/elasticsearch';

dotenv.config();

console.log('--- SEARCH-SERVICE-STARTING (TYPESCRIPT) ---');

const app = express();
const port = process.env.PORT || 3000;
const searchController = new SearchController();

app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// --- Routes ---
// Support both /search and /search/
app.get(['/search', '/search/'], (req: Request, res: Response) => searchController.search(req, res));
app.get(['/search/suggestions', '/search/suggestions/'], (req: Request, res: Response) => searchController.getSuggestions(req, res));
app.get(['/search/categories', '/search/categories/'], (req: Request, res: Response) => searchController.getCategories(req, res));

// Health Check
app.get('/search/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'search-service (typescript)' });
});

// --- Unified Error Handler ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SEARCH-SERVICE ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// --- Startup Pattern ---
const start = async () => {
    try {
      // Small health check for ES
      await esClient.ping();
      console.log('--- SEARCH-SERVICE: ELASTICSEARCH CONNECTED ---');
      
      app.listen(port as number, '0.0.0.0', () => {
        console.log(`Search service listening at http://0.0.0.0:${port}`);
      });
    } catch (err: any) {
      console.error('--- SEARCH-SERVICE: ELASTICSEARCH CONNECTION FAILED ---', err.message);
      // In production we might not want to exit if ES is transient, 
      // but following product-service model:
      process.exit(1);
    }
  };
  
start();
