import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto, formatProductResponse } from '../dtos/product.dto';

const productService = new ProductService();

export class ProductController {
  async getProducts(req: Request, res: Response) {
    try {
      const query = ProductQueryDto.parse(req.query);
      const result = await productService.getProducts(query);
      res.json({
        ...result,
        products: result.products.map(formatProductResponse)
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(formatProductResponse(product));
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const parsedBody = CreateProductDto.parse(req.body);
      const product = await productService.createProduct(parsedBody);
      res.status(201).json(formatProductResponse(product));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const parsedBody = UpdateProductDto.parse(req.body);
      const product = await productService.updateProduct(req.params.id, parsedBody);
      res.json(formatProductResponse(product));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await productService.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
