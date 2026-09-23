'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Edit3, Trash2, Eye, AlertTriangle } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Out of Stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Low ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        In Stock ({stock})
      </span>
    );
  };

  return (
    <div className="w-full overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500 tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Product</th>
              <th scope="col" className="px-4 py-3.5">Category</th>
              <th scope="col" className="px-4 py-3.5">Price</th>
              <th scope="col" className="px-4 py-3.5">Rating</th>
              <th scope="col" className="px-4 py-3.5">Stock</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-indigo-50/30 transition-colors group"
              >
                {/* Product Image & Title */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/100x100?text=No+Image';
                        }}
                      />
                      {product.isLocal && (
                        <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white" title="Locally added/modified" />
                      )}
                    </div>
                    <div className="max-w-xs">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 text-sm block"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-gray-400 capitalize">
                        {product.brand || 'Generic'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-4">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <span className="ml-1.5 text-[11px] font-semibold text-emerald-600">
                        {Math.round(product.discountPercentage)}% off
                      </span>
                    )}
                  </div>
                </td>

                {/* Rating */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-gray-900">
                      {product.rating ? product.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </td>

                {/* Stock Status */}
                <td className="px-4 py-4">
                  {getStockBadge(product.stock)}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
