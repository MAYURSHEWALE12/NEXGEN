'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Edit2, Trash2, ExternalLink } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          Out of stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Low ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {stock} in stock
      </span>
    );
  };

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-zinc-900">Product</th>
              <th scope="col" className="px-4 py-3 font-semibold text-zinc-900">Category</th>
              <th scope="col" className="px-4 py-3 font-semibold text-zinc-900 text-right">Price</th>
              <th scope="col" className="px-4 py-3 font-semibold text-zinc-900 text-center">Rating</th>
              <th scope="col" className="px-4 py-3 font-semibold text-zinc-900">Inventory</th>
              <th scope="col" className="px-4 py-3 font-semibold text-zinc-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-zinc-50/80 transition-colors group"
              >
                {/* Product Info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/80x80?text=No+Img';
                        }}
                      />
                    </div>
                    <div className="min-w-0 max-w-sm">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-zinc-900 hover:text-blue-600 transition-colors truncate block text-sm"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-zinc-400 capitalize">
                        {product.brand || 'Generic'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200/60">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3 text-right font-mono text-zinc-900 font-medium">
                  ${product.price.toFixed(2)}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="ml-1 text-[11px] text-zinc-400 font-normal">
                      (-{Math.round(product.discountPercentage)}%)
                    </span>
                  )}
                </td>

                {/* Rating */}
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating ? product.rating.toFixed(1) : '-'}</span>
                  </div>
                </td>

                {/* Stock Status */}
                <td className="px-4 py-3">
                  {getStockStatus(product.stock)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
