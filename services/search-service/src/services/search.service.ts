import { SearchRepository } from '../repositories/search.repository';
import { SearchResponseDto, SuggestionDto, SuggestionsResponseDto } from '../dtos/search.dto';

/**
 * Search Service
 * High-level business logic for Search, including Query construction and Result Mapping
 */
export class SearchService {
  private searchRepository: SearchRepository;

  constructor() {
    this.searchRepository = new SearchRepository();
  }

  /**
   * Search Products with filters and sorting
   * @param q 
   * @param category 
   * @param minPrice 
   * @param maxPrice 
   * @param page 
   * @param limit 
   * @param sortBy 
   */
  public async searchProducts(
    q?: string,
    category?: string,
    minPrice?: string,
    maxPrice?: string,
    page: string = '1',
    limit: string = '12',
    sortBy: string = 'default',
    hasDiscount?: string
  ): Promise<SearchResponseDto> {
    const searchTerm = q || '*';
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;

    // --- 1. Complex Query DSL Construction ---
    const queryDSL: any = {
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

    // Separating category filter to postFilter to keep aggregations accurate for other categories
    const postFilter: any = {
      bool: {
        filter: []
      }
    };

    if (category) {
      postFilter.bool.filter.push({ term: { categoryId: category } });
    }

    if (minPrice || maxPrice) {
      postFilter.bool.filter.push({
        range: {
          price: {
            gte: minPrice ? parseFloat(minPrice) : 0,
            lte: maxPrice ? parseFloat(maxPrice) : 999999
          }
        }
      });
    }

    if (hasDiscount === 'true') {
      postFilter.bool.filter.push({ exists: { field: 'originalPrice' } });
    }

    // --- 2. Sorting Logic (Matches earlier standard) ---
    // ... rest of logic remains same ...
    let sort: any[] = [];
    if (sortBy === 'price-low') sort.push({ price: 'asc' });
    else if (sortBy === 'price-high') sort.push({ price: 'desc' });
    else if (sortBy === 'newest') sort.push({ createdAt: 'desc' });
    else if (sortBy === 'best-selling') sort.push({ stock: 'desc' });
    else sort.push({ _score: 'desc' });

    console.log('[ELASTICSEARCH] Query DSL:', JSON.stringify(queryDSL, null, 2));
    if (postFilter.bool.filter.length > 0) {
      console.log('[ELASTICSEARCH] PostFilter DSL:', JSON.stringify(postFilter, null, 2));
    }

    // --- 3. Execute through Repository ---
    try {
      const rawResult = await this.searchRepository.searchProducts(
        queryDSL,
        sort,
        from,
        limitNum,
        postFilter.bool.filter.length > 0 ? postFilter : undefined
      );
    // ... mapping ...

      // --- 4. Mapping Result to Clean DTOs ---
      const hits = rawResult?.body?.hits?.hits || [];
      const total = rawResult?.body?.hits?.total?.value || 0;
      
      const rawAggs = rawResult?.body?.aggregations?.categories?.buckets || [];
      const aggregations = rawAggs.reduce((acc: any, bucket: any) => {
        acc[bucket.key] = bucket.doc_count;
        return acc;
      }, {});

      const products = hits.map((hit: any) => {
        const source = hit._source;
        const minPriceVal = parseFloat(source.price) || 0;
        return {
          id: hit._id,
          name: source.name,
          slug: source.slug,
          description: source.description,
          categoryId: source.categoryId,
          category: { name: source.category },
          price: minPriceVal,
          originalPrice: source.originalPrice || (minPriceVal * 1.2),
          stock: parseInt(source.stock) || 0,
          variants: [{ price: minPriceVal }],
          images: source.image ? [{ imageUrl: source.image }] : [],
          image: source.image || null,
          score: hit._score || 0
        };
      });

      return {
        source: products[0]?.id.startsWith('fallback') ? 'fallback' : 'elasticsearch',
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        },
        aggregations
      };
    } catch (error: any) {
      console.error('[SEARCH-SERVICE] Elasticsearch Error:', error.message);
      return { 
        source: 'error-fallback', products: [], aggregations: {}, 
        pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 } 
      };
    }
  }

  /**
   * Get Search Suggestions
   * @param q 
   */
  public async getSuggestions(q: string): Promise<SuggestionsResponseDto> {
    const rawResult = await this.searchRepository.getSuggestions(q);
    const hits = rawResult.body?.hits?.hits || [];

    const suggestions: SuggestionDto[] = hits.map((hit: any) => ({
      id: hit._source.id,
      name: hit._source.name,
      slug: hit._source.slug,
      image: hit._source.image,
      price: hit._source.price
    }));

    return { results: suggestions };
  }

  /**
   * Get all categories from ES and BUILD HIERARCHY
   */
  public async getCategories(): Promise<any[]> {
    const rawResult = await this.searchRepository.getCategories();
    const hits = rawResult?.body?.hits?.hits || [];
    
    const flatArr = hits.map((hit: any) => ({
      id: hit._source.id,
      name: hit._source.name,
      slug: hit._source.slug,
      parentId: hit._source.parentId,
      imageUrl: hit._source.imageUrl,
      description: hit._source.description,
      children: []
    }));

    // Build the tree
    const roots: any[] = [];
    const lookup = new Map();

    flatArr.forEach((c: any) => lookup.set(c.id, c));
    flatArr.forEach((c: any) => {
      if (c.parentId && lookup.has(c.parentId)) {
        lookup.get(c.parentId).children.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }
}
