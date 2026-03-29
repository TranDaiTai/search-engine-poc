import { esClient } from '../config/elasticsearch';

/**
 * Search Repository
 * Handles direct, low-level interaction with Elasticsearch Client
 */
export class SearchRepository {
  /**
   * Execute a search query in ES
   * @param query ES Query DSL (bool, match, etc)
   * @param sort  ES Sort DSL
   * @param from  Offset
   * @param size  Limit
   * @param index ES Index
   */
  public async searchProducts(query: any, sort: any[], from: number, size: number, index: string = 'products'): Promise<any> {
    try {
      return await esClient.search({
        index,
        body: { 
          query, 
          sort,
          from, 
          size,
          // Aggregations to fix the 0-count category sidebar bug
          aggs: {
            categories: {
              terms: {
                field: 'categoryId',
                size: 50
              }
            }
          }
        }
      });
    } catch (error: any) {
      console.error('[REPOSITORY] ES Error:', error.message);
      throw error;
    }
  }

  /**
   * Suggestion Query in ES
   * @param q  Search term
   * @param index ES Index
   */
  public async getSuggestions(q: string, index: string = 'products'): Promise<any> {
    try {
      return await esClient.search({
        index,
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
    } catch (error: any) {
      console.error('[REPOSITORY] ES Suggestion Error:', error.message);
      return { body: { hits: { hits: [] } } };
    }
  }

  /**
   * Get all categories from ES
   */
  public async getCategories(index: string = 'categories'): Promise<any> {
    try {
      return await esClient.search({
        index,
        body: {
          size: 100,
          query: { match_all: {} }
        }
      });
    } catch (error: any) {
      console.error('[REPOSITORY] ES Categories Error:', error.message);
      return { body: { hits: { hits: [] } } };
    }
  }
}
