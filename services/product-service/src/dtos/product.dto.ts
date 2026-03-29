import { z } from 'zod';

export const ProductVariantDto = z.object({
  sku: z.string().min(1),
  price: z.number().min(0),
  stockQuantity: z.number().int().min(0),
  attributes: z.record(z.any()).optional(),
});

export const ProductImageDto = z.object({
  imageUrl: z.string().url(),
  isMain: z.boolean().default(false),
  position: z.number().int().default(0),
});

export const CreateProductDto = z.object({
  name: z.string().min(1),
  slug: z.string().optional(), // Will be auto-generated if omitted
  description: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  variants: z.array(ProductVariantDto).default([]),
  images: z.array(ProductImageDto).default([]),
});

export const UpdateProductDto = CreateProductDto.partial();

export const ProductQueryDto = z.object({
  page: z.string().optional().transform((val: string | undefined) => parseInt(val || '1')),
  limit: z.string().optional().transform((val: string | undefined) => parseInt(val || '20')),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.string().optional().transform((val: string | undefined) => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform((val: string | undefined) => val ? parseFloat(val) : undefined),
  sort: z.enum(['newest', 'price-low', 'price-high']).default('newest'),
});

export type CreateProductType = z.infer<typeof CreateProductDto>;
export type UpdateProductType = z.infer<typeof UpdateProductDto>;
export type ProductQueryType = z.infer<typeof ProductQueryDto>;

// Format raw prisma product into a standardized Response DTO
export function formatProductResponse(product: any) {
  if (!product) return null;
  
  const minPrice = product.variants?.length 
    ? Math.min(...product.variants.map((v: any) => parseFloat(v.price) || 0)) 
    : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    category: product.category,
    isActive: product.isActive,
    price: minPrice, // Derived for convenience
    originalPrice: minPrice * 1.2, // Mock discount matching FE mock logic if needed, or omit
    variants: product.variants?.map((v: any) => ({
      ...v,
      price: parseFloat(v.price)
    })) || [],
    images: product.images || [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
