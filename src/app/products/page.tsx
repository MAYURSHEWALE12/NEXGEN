'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, CategoryItem, ProductFormData } from '@/types';
import { productService } from '@/services/productService';
import { useProductsContext } from '@/context/ProductContext';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { FilterSortBar } from '@/components/FilterSortBar';
import { Pagination } from '@/components/Pagination';
import { ProductTable } from '@/components/ProductTable';
import { ProductCardList } from '@/components/ProductCardList';
import { ProductModal } from '@/components/ProductModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { TableSkeleton, CardsSkeleton } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Plus, LayoutGrid, Table as TableIcon } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local mutation overlay context
  const {
    locallyAdded,
    locallyUpdated,
    locallyDeletedIds,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    applyLocalModifications,
    isSubmitting: isMutationSubmitting,
  } = useProductsContext();

  // --- URL State Parsing & Validation ---
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sortBy') || '';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  // --- State Variables ---
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive View Toggle (Desktop Table vs Mobile Cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Active request tracking to avoid race conditions
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef<number>(0);

  // --- Helper to update URL params cleanly ---
  const updateUrlParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || (key === 'category' && value === 'all')) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  // --- Load Categories Once ---
  useEffect(() => {
    productService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to fetch categories', err));
  }, []);

  // --- Fetch Products with Debounce / Race Condition Cancellation ---
  const fetchProducts = useCallback(async () => {
    // Cancel any previous pending request
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;
    const currentRequestId = ++requestCounterRef.current;

    setIsLoading(true);
    setError(null);

    const skip = (page - 1) * limit;

    try {
      // Handle the DummyJSON architectural limitation: Search + Category simultaneous query
      if (search && search.trim().length > 0 && category && category !== 'all') {
        // Fetch matching search results from API, then filter by category
        const response = await productService.getProducts({
          search,
          limit: 100, // Fetch broader set for accurate client category filter
          skip: 0,
          sortBy: sortBy || undefined,
          order,
          signal: abortController.signal,
        });

        if (currentRequestId !== requestCounterRef.current) return;

        // Apply category filter
        const categoryFiltered = response.products.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );

        // Apply local additions/edits/deletions
        const { products: modified, total: adjustedTotal } = applyLocalModifications(
          categoryFiltered,
          categoryFiltered.length
        );

        // Paginate slice
        const paginated = modified.slice(skip, skip + limit);
        setProducts(paginated);
        setTotal(adjustedTotal);
      } else {
        // Standard API query (Search OR Category OR General pagination)
        const response = await productService.getProducts({
          limit,
          skip,
          search: search || undefined,
          category: category !== 'all' ? category : undefined,
          sortBy: sortBy || undefined,
          order,
          signal: abortController.signal,
        });

        if (currentRequestId !== requestCounterRef.current) return;

        // Apply local additions/updates/deletions overlay
        const { products: modified, total: adjustedTotal } = applyLocalModifications(
          response.products,
          response.total
        );

        setProducts(modified);
        setTotal(adjustedTotal);
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return; // Ignore aborted requests
      }
      if (currentRequestId === requestCounterRef.current) {
        setError(err.message || 'Failed to fetch products. Please try again.');
      }
    } finally {
      if (currentRequestId === requestCounterRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit, search, category, sortBy, order, applyLocalModifications]);

  useEffect(() => {
    fetchProducts();
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // --- Handlers for URL State Updates ---
  const handleSearchChange = (query: string) => {
    updateUrlParams({
      q: query || null,
      page: 1, // Reset to page 1 on search change
    });
  };

  const handleCategoryChange = (newCat: string) => {
    updateUrlParams({
      category: newCat === 'all' ? null : newCat,
      page: 1, // Reset to page 1 on filter change
    });
  };

  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    updateUrlParams({
      sortBy: newSortBy || null,
      order: newSortBy ? newOrder : null,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateUrlParams({ limit: newSize, page: 1 });
  };

  const handleResetFilters = () => {
    updateUrlParams({
      q: null,
      category: null,
      sortBy: null,
      order: null,
      page: 1,
    });
  };

  // --- CRUD Modal Handlers ---
  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleModalSubmit = async (formData: ProductFormData) => {
    if (editingProduct) {
      await handleUpdateProduct(editingProduct.id, formData);
    } else {
      await handleAddProduct(formData);
    }
    fetchProducts();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    await handleDeleteProduct(deletingProduct.id);
    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
    fetchProducts();
  };

  const isFiltered = !!search || category !== 'all' || !!sortBy;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Products Inventory
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage, search, sort, and organize catalog items seamlessly
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle for Tablet/Desktop */}
            <div className="hidden sm:flex items-center p-1 bg-white border border-gray-200 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'table'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Add Product Button */}
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar Row */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <SearchBar
            initialValue={search}
            onSearchChange={handleSearchChange}
            isLoading={isLoading}
          />
          <FilterSortBar
            categories={categories}
            selectedCategory={category}
            sortBy={sortBy}
            order={order}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onReset={handleResetFilters}
            isFiltered={isFiltered}
          />
        </div>

        {/* Content Area: Loading, Error, Empty, or Products List */}
        {isLoading ? (
          <div>
            <div className="hidden md:block">
              <TableSkeleton />
            </div>
            <div className="block md:hidden">
              <CardsSkeleton />
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No matching products"
            message={
              isFiltered
                ? 'Try adjusting your search query, clearing filters, or resetting category.'
                : 'No products are currently available in the catalog.'
            }
            onReset={isFiltered ? handleResetFilters : undefined}
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table (or selected viewMode) */}
            <div className={viewMode === 'table' ? 'hidden md:block' : 'hidden'}>
              <ProductTable
                products={products}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </div>

            {/* Mobile Card List (always on mobile or if cards selected) */}
            <div className={viewMode === 'cards' ? 'block' : 'block md:hidden'}>
              <ProductCardList
                products={products}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </div>

            {/* Custom Pagination Component */}
            <Pagination
              currentPage={page}
              totalItems={total}
              pageSize={limit}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        productToEdit={editingProduct}
        categories={categories}
        isSubmitting={isMutationSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={deletingProduct}
        isDeleting={isMutationSubmitting}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
