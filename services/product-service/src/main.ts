import express, { Request, Response } from 'express';
import cors from 'cors';
import { ProductController } from './controllers/product.controller';
import prisma from './config/database';

console.log('--- PRODUCT-SERVICE-STARTING ---');

const app = express();
const port = process.env.PORT || 3001;
const productController = new ProductController();

app.use(cors());
app.use(express.json());

// Routes
app.get('/products', (req: Request, res: Response) => productController.getProducts(req, res));
app.get('/products/:id', (req: Request, res: Response) => productController.getProductById(req, res));
app.post('/products', (req: Request, res: Response) => productController.createProduct(req, res));
app.put('/products/:id', (req: Request, res: Response) => productController.updateProduct(req, res));
app.delete('/products/:id', (req: Request, res: Response) => productController.deleteProduct(req, res));

app.get('/categories', (req: Request, res: Response) => productController.getCategories(req, res));

// Database connection & Startup
const start = async () => {
  try {
    await prisma.$connect();
    console.log('--- PRODUCT-SERVICE: DATABASE CONNECTED ---');
    app.listen(port as number, '0.0.0.0', () => {
      console.log(`Product service listening at http://0.0.0.0:${port}`);
    });
  } catch (err: any) {
    console.error('--- PRODUCT-SERVICE: DB CONNECTION FAILED ---', err.message);
    process.exit(1);
  }
};

start();
