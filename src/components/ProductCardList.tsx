'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Edit3, Trash2, Eye } from 'lucide-react';

interface ProductCardListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCardList({ products, onEdit, onDelete }: ProductCardListProps) {
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Out of Stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Low ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        Stock ({stock})
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            {/* Top row: Image + Info */}
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/100x100?text=No+Image';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 capitalize">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-gray-800">
                      {product.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 text-sm mt-1.5"
                >
                  {product.title}
                </Link>
                <p className="text-xs text-gray-400 capitalize">
                  {product.brand || 'Generic'}
                </p>
              </div>
            </div>

            {/* Middle row: Price and Stock */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div>
                <span className="text-base font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="ml-1.5 text-xs font-semibold text-emerald-600">
                    {Math.round(product.discountPercentage)}% off
                  </span>
                )}
              </div>
              {getStockBadge(product.stock)}
            </div>
          </div>

          {/* Bottom row: Actions */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
            <Link
              href={`/products/${product.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-gray-200 text-xs font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-2 rounded-xl bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-700 border border-gray-200 text-xs font-semibold transition-colors"
              title="Edit Product"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="p-2 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-700 border border-gray-200 text-xs font-semibold transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
