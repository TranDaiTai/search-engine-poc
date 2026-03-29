import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';

/**
 * Search Controller
 * Handles Request / Response and delegates logic to Service
 */
export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  /**
   * GET /search/
   */
  public search = async (req: Request, res: Response): Promise<void> => {
    const { q, category, minPrice, maxPrice, page, limit, sortBy, hasDiscount } = req.query;

    console.log(`[SEARCH] Controller: q=${q}, category=${category}, page=${page}, hasDiscount=${hasDiscount}`);

    try {
      const result = await this.searchService.searchProducts(
        q as string,
        category as string,
        minPrice as string,
        maxPrice as string,
        page as string,
        limit as string,
        sortBy as string,
        hasDiscount as string
      );
      res.json(result);
    } catch (error: any) {
      console.error('[SEARCH] Controller Error:', error.message);
      res.status(500).json({ error: 'Search execution failed.', details: error.message });
    }
  };

  /**
   * GET /search/suggestions
   */
  public getSuggestions = async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      res.json({ results: [] });
      return;
    }

    console.log(`[SUGGEST] Controller: q=${q}`);

    try {
      const result = await this.searchService.getSuggestions(q as string);
      res.json(result);
    } catch (error: any) {
      console.error('[SUGGEST] Controller Error:', error.message);
      res.json({ results: [] });
    }
  };

  /**
   * GET /categories
   */
  public getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.searchService.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error('[CATEGORIES] Controller Error:', error.message);
      res.status(500).json([]);
    }
  };
}
