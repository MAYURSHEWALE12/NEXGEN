import apiClient from './apiClient';
import { Product, ProductsResponse, CategoryItem, ProductFormData } from '@/types';

export interface FetchProductsParams {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  signal?: AbortSignal;
}

export const productService = {
  /**
   * Fetch products with support for pagination, search, category filtering, and sorting.
   * Also accepts an AbortSignal to cancel in-flight requests on rapid changes.
   */
  async getProducts(params: FetchProductsParams = {}): Promise<ProductsResponse> {
    const { limit = 10, skip = 0, search, category, sortBy, order, signal } = params;

    let url = '/products';
    const queryParams: Record<string, any> = {
      limit,
      skip,
    };

    if (sortBy) {
      queryParams.sortBy = sortBy;
      queryParams.order = order || 'asc';
    }

    // Determine correct endpoint based on search / category
    if (search && search.trim().length > 0) {
      url = '/products/search';
      queryParams.q = search.trim();
    } else if (category && category !== 'all') {
      url = `/products/category/${encodeURIComponent(category)}`;
    }

    const response = await apiClient.get<ProductsResponse>(url, {
      params: queryParams,
      signal,
    });

    return response.data;
  },

  /**
   * Fetch all categories
   */
  async getCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get<any[]>('/products/categories');
    // DummyJSON v2 returns array of objects [{slug, name, url}], older returned string[]
    return response.data.map((cat) => {
      if (typeof cat === 'string') {
        return { slug: cat, name: cat.charAt(0).toUpperCase() + cat.slice(1) };
      }
      return {
        slug: cat.slug || cat.name,
        name: cat.name || cat.slug,
        url: cat.url,
      };
    });
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id: number | string, signal?: AbortSignal): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`, { signal });
    return response.data;
  },

  /**
   * Add a new product (DummyJSON mock POST)
   */
  async addProduct(productData: ProductFormData): Promise<Product> {
    const response = await apiClient.post<Product>('/products/add', productData);
    return response.data;
  },

  /**
   * Update an existing product (DummyJSON mock PUT)
   */
  async updateProduct(id: number, productData: Partial<ProductFormData>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete a product (DummyJSON mock DELETE)
   */
  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
