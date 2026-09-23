'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, ProductFormData } from '@/types';
import { productService } from '@/services/productService';
import { useToast } from './ToastContext';

interface ProductContextType {
  locallyAdded: Product[];
  locallyUpdated: Record<number, Partial<Product>>;
  locallyDeletedIds: number[];
  handleAddProduct: (formData: ProductFormData) => Promise<Product>;
  handleUpdateProduct: (id: number, formData: Partial<ProductFormData>) => Promise<Product>;
  handleDeleteProduct: (id: number) => Promise<void>;
  applyLocalModifications: (fetchedProducts: Product[], totalCount: number) => { products: Product[]; total: number };
  isSubmitting: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [locallyAdded, setLocallyAdded] = useState<Product[]>([]);
  const [locallyUpdated, setLocallyUpdated] = useState<Record<number, Partial<Product>>>({});
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Load state from localStorage on init for session persistence
  useEffect(() => {
    try {
      const savedAdded = localStorage.getItem('local_added_products');
      const savedUpdated = localStorage.getItem('local_updated_products');
      const savedDeleted = localStorage.getItem('local_deleted_ids');

      if (savedAdded) setLocallyAdded(JSON.parse(savedAdded));
      if (savedUpdated) setLocallyUpdated(JSON.parse(savedUpdated));
      if (savedDeleted) setLocallyDeletedIds(JSON.parse(savedDeleted));
    } catch (e) {
      console.error('Failed to load local product mutations', e);
    }
  }, []);

  const saveToStorage = (added: Product[], updated: Record<number, Partial<Product>>, deleted: number[]) => {
    try {
      localStorage.setItem('local_added_products', JSON.stringify(added));
      localStorage.setItem('local_updated_products', JSON.stringify(updated));
      localStorage.setItem('local_deleted_ids', JSON.stringify(deleted));
    } catch (e) {
      console.error('Failed to persist local mutations', e);
    }
  };

  const handleAddProduct = async (formData: ProductFormData): Promise<Product> => {
    setIsSubmitting(true);
    try {
      // 1. Send API call via Axios as per requirement
      const response = await productService.addProduct(formData);
      
      // Generate a unique ID if mock API returns a standard id like 195
      const newProduct: Product = {
        ...response,
        id: response.id || Date.now(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        brand: formData.brand || 'Generic',
        rating: formData.rating || 5.0,
        thumbnail: formData.thumbnail || 'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png',
        images: [formData.thumbnail || 'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png'],
        reviews: [],
        isLocal: true,
      };

      const updatedList = [newProduct, ...locallyAdded];
      setLocallyAdded(updatedList);
      saveToStorage(updatedList, locallyUpdated, locallyDeletedIds);

      showToast(`Product "${newProduct.title}" added successfully!`, 'success');
      return newProduct;
    } catch (error: any) {
      showToast(error.message || 'Failed to add product', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (id: number, formData: Partial<ProductFormData>): Promise<Product> => {
    setIsSubmitting(true);
    try {
      // 1. Call DummyJSON PUT
      const response = await productService.updateProduct(id, formData);

      // 2. Check if product is in locallyAdded
      const isLocallyAdded = locallyAdded.some((p) => p.id === id);
      if (isLocallyAdded) {
        const newAdded = locallyAdded.map((p) => (p.id === id ? { ...p, ...formData } : p));
        setLocallyAdded(newAdded);
        saveToStorage(newAdded, locallyUpdated, locallyDeletedIds);
      } else {
        const newUpdated = {
          ...locallyUpdated,
          [id]: {
            ...(locallyUpdated[id] || {}),
            ...formData,
          },
        };
        setLocallyUpdated(newUpdated);
        saveToStorage(locallyAdded, newUpdated, locallyDeletedIds);
      }

      showToast(`Product "${formData.title || 'Product'}" updated successfully!`, 'success');
      return { ...response, ...formData };
    } catch (error: any) {
      showToast(error.message || 'Failed to update product', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number): Promise<void> => {
    setIsSubmitting(true);
    try {
      // 1. Call DummyJSON DELETE
      await productService.deleteProduct(id);

      // 2. Update local state
      const isLocallyAdded = locallyAdded.some((p) => p.id === id);
      let newAdded = locallyAdded;
      let newDeleted = locallyDeletedIds;

      if (isLocallyAdded) {
        newAdded = locallyAdded.filter((p) => p.id !== id);
        setLocallyAdded(newAdded);
      } else {
        if (!locallyDeletedIds.includes(id)) {
          newDeleted = [...locallyDeletedIds, id];
          setLocallyDeletedIds(newDeleted);
        }
      }

      saveToStorage(newAdded, locallyUpdated, newDeleted);
      showToast('Product deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete product', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Applies local additions, modifications, and deletions to API results
   */
  const applyLocalModifications = useCallback(
    (fetchedProducts: Product[], totalCount: number) => {
      // 1. Filter out deleted IDs
      let modified = fetchedProducts.filter((p) => !locallyDeletedIds.includes(p.id));

      // 2. Apply updates
      modified = modified.map((p) => {
        if (locallyUpdated[p.id]) {
          return { ...p, ...locallyUpdated[p.id] };
        }
        return p;
      });

      // Calculate adjusted total
      const deletedCountFromApi = locallyDeletedIds.length;
      const adjustedTotal = Math.max(0, totalCount - deletedCountFromApi + locallyAdded.length);

      return {
        products: modified,
        total: adjustedTotal,
      };
    },
    [locallyAdded, locallyUpdated, locallyDeletedIds]
  );

  return (
    <ProductContext.Provider
      value={{
        locallyAdded,
        locallyUpdated,
        locallyDeletedIds,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        applyLocalModifications,
        isSubmitting,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductProvider');
  }
  return context;
}
