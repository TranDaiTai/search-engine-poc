import { CreateProductType, ProductQueryType, UpdateProductType } from '../dtos/product.dto';
import { ProductRepository } from '../repositories/product.repository';

const productRepository = new ProductRepository();

export class ProductService {
  async getProducts(query: ProductQueryType) {
    return productRepository.findAll(query);
  }

  async getProductById(idOrSlug: string) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async createProduct(data: CreateProductType) {
    return productRepository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductType) {
    return productRepository.update(id, data);
  }

  async deleteProduct(id: string) {
    return productRepository.delete(id);
  }

  async getCategories() {
    return productRepository.findCategories();
  }
}
