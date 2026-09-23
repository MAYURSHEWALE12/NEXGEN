'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductFormData, CategoryItem } from '@/types';
import { X, Loader2 } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => Promise<void>;
  productToEdit?: Product | null;
  categories: CategoryItem[];
  isSubmitting?: boolean;
}

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  categories,
  isSubmitting = false,
}: ProductModalProps) {
  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    brand: '',
    thumbnail: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || '',
        description: productToEdit.description || '',
        category: productToEdit.category || '',
        price: productToEdit.price || 0,
        stock: productToEdit.stock || 0,
        brand: productToEdit.brand || '',
        thumbnail: productToEdit.thumbnail || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: categories.length > 0 ? categories[0].slug : '',
        price: 0,
        stock: 0,
        brand: '',
        thumbnail: '',
      });
    }
    setErrors({});
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.price === undefined || formData.price === null || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stock === undefined || formData.stock === null || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock must be non-negative';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    try {
      await onSubmit({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });
      onClose();
    } catch (err) {
      // error handled via toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-zinc-200 relative animate-in fade-in zoom-in-98 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              {isEditing ? 'Edit product' : 'Add product'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isEditing ? 'Modify catalog product values' : 'Create a new catalog item'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mechanical Keyboard"
              className={`w-full px-3 py-1.5 rounded-md border text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 transition-colors ${
                errors.title
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                  : 'border-zinc-300 focus:ring-zinc-900 focus:border-zinc-900'
              }`}
            />
            {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-[11px] text-red-600 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Logitech"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="49.99"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 font-mono"
              />
              {errors.price && <p className="text-[11px] text-red-600 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock !== undefined ? formData.stock : ''}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                placeholder="50"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 font-mono"
              />
              {errors.stock && <p className="text-[11px] text-red-600 mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product summary and key specifications..."
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
            {errors.description && <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-md border border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'Save changes' : 'Create product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
