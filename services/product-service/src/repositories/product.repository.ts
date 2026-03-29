import prisma from '../config/database';
import { CreateProductType, ProductQueryType, UpdateProductType } from '../dtos/product.dto';
import * as crypto from 'crypto';

function generateSlug(name: string) {
  const shortId = crypto.randomUUID().split('-')[0];
  const slugified = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${slugified}-${shortId}`;
}

export class ProductRepository {
  async findAll(query: ProductQueryType) {
    const { page, limit, search, categoryId, minPrice, maxPrice, sort } = query;
    const skip = (page - 1) * limit;

    const where: any = { AND: [] };
    if (search) {
      where.AND.push({ name: { contains: search, mode: 'insensitive' } });
    }
    if (categoryId) {
      where.AND.push({ categoryId });
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.AND.push({
        variants: {
          some: {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          },
        },
      });
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { variants: { _min: { price: 'asc' } } };
    if (sort === 'price-high') orderBy = { variants: { _max: { price: 'desc' } } };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where.AND.length > 0 ? where : {},
        skip,
        take: limit,
        include: {
          category: true,
          variants: true,
          images: { orderBy: { position: 'asc' } },
        },
        orderBy,
      }),
      prisma.product.count({
        where: where.AND.length > 0 ? where : {},
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByIdOrSlug(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
    const whereClause = isUuid ? { id: idOrSlug } : { slug: idOrSlug };
    
    return prisma.product.findUnique({
      where: whereClause,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: 'asc' } },
      },
    });
  }

  async create(data: CreateProductType) {
    const { variants, images, ...productData } = data;
    const slug = productData.slug || generateSlug(productData.name);
    
    return prisma.product.create({
      data: {
        ...productData,
        slug,
        categoryId: productData.categoryId || undefined,
        variants: {
          create: variants.map((v: any) => ({
            ...v,
            price: v.price.toString() as any, // Decimal as string for prisma
          })),
        },
        images: {
          create: images,
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });
  }

  async update(id: string, data: UpdateProductType) {
    const { variants, images, ...productData } = data;

    return prisma.$transaction(async (tx: any) => {
      // 1. Update basic info
      await tx.product.update({
        where: { id },
        data: {
          ...productData,
          categoryId: productData.categoryId || undefined,
        },
      });

      // 2. Sync variants (Simplified: Replace all)
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productVariant.createMany({
          data: variants.map((v: any) => ({
            ...v,
            productId: id,
            price: v.price.toString() as any,
          })),
        });
      }

      // 3. Sync images
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((img: any) => ({
            ...img,
            productId: id,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { variants: true, images: true },
      });
    });
  }

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  // Categories
  async findCategories() {
    return prisma.category.findMany({
      include: { children: true },
      where: { parentId: null },
    });
  }
}
