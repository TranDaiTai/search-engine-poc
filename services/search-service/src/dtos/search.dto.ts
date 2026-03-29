/**
 * Standard Product DTO for Search Results
 */
export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category: {
    name: string;
  };
  price: number;
  originalPrice: number;
  variants: any[];
  images: Array<{ imageUrl: string }>;
  score?: number;
}

/**
 * Detailed Pagination Metadata
 */
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Standard Search Response
 */
export interface SearchResponseDto {
  source: 'elasticsearch' | 'cache' | 'fallback' | 'error-fallback';
  products: ProductDto[];
  pagination: PaginationDto;
  aggregations?: any; // Category aggregation results
}

/**
 * Autocomplete Suggestion Item
 */
export interface SuggestionDto {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
}

/**
 * Autocomplete Response
 */
export interface SuggestionsResponseDto {
  results: SuggestionDto[];
}
