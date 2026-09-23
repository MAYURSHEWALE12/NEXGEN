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
import { Plus } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    applyLocalModifications,
    isSubmitting: isMutationSubmitting,
  } = useProductsContext();

  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sortBy') || '';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef<number>(0);

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

  useEffect(() => {
    productService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to fetch categories', err));
  }, []);

  const fetchProducts = useCallback(async () => {
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
      if (search && search.trim().length > 0 && category && category !== 'all') {
        const response = await productService.getProducts({
          search,
          limit: 100,
          skip: 0,
          sortBy: sortBy || undefined,
          order,
          signal: abortController.signal,
        });

        if (currentRequestId !== requestCounterRef.current) return;

        const categoryFiltered = response.products.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );

        const { products: modified, total: adjustedTotal } = applyLocalModifications(
          categoryFiltered,
          categoryFiltered.length
        );

        const paginated = modified.slice(skip, skip + limit);
        setProducts(paginated);
        setTotal(adjustedTotal);
      } else {
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

        const { products: modified, total: adjustedTotal } = applyLocalModifications(
          response.products,
          response.total
        );

        setProducts(modified);
        setTotal(adjustedTotal);
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
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

  const handleSearchChange = (query: string) => {
    updateUrlParams({ q: query || null, page: 1 });
  };

  const handleCategoryChange = (newCat: string) => {
    updateUrlParams({ category: newCat === 'all' ? null : newCat, page: 1 });
  };

  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    updateUrlParams({ sortBy: newSortBy || null, order: newSortBy ? newOrder : null, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateUrlParams({ limit: newSize, page: 1 });
  };

  const handleResetFilters = () => {
    updateUrlParams({ q: null, category: null, sortBy: null, order: null, page: 1 });
  };

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
    <div className="min-h-screen bg-zinc-50/60 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-4">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Products
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage inventory, pricing, and catalog details
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add product</span>
            </button>
          </div>
        </div>

        {/* Filter / Search toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

        {/* Main Content Area */}
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
            title="No products found"
            message={
              isFiltered
                ? 'No items matched your current filter or search criteria.'
                : 'No products are available in this catalog.'
            }
            onReset={isFiltered ? handleResetFilters : undefined}
          />
        ) : (
          <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <ProductTable
                products={products}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden">
              <ProductCardList
                products={products}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </div>

            {/* Custom Pagination */}
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

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        productToEdit={editingProduct}
        categories={categories}
        isSubmitting={isMutationSubmitting}
      />

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
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
