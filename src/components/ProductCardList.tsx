'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Edit2, Trash2 } from 'lucide-react';

interface ProductCardListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCardList({ products, onEdit, onDelete }: ProductCardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-md bg-zinc-50 border border-zinc-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Img';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 capitalize border border-zinc-200/50">
                  {product.category}
                </span>
                <Link
                  href={`/products/${product.id}`}
                  className="font-medium text-zinc-900 hover:text-blue-600 transition-colors truncate block text-sm mt-1"
                >
                  {product.title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-zinc-400 capitalize">{product.brand || 'Generic'}</span>
                  <span className="text-zinc-300">•</span>
                  <div className="flex items-center gap-0.5 text-xs text-zinc-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating ? product.rating.toFixed(1) : '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100 text-xs">
              <span className="font-mono font-semibold text-zinc-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-zinc-500">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100">
            <Link
              href={`/products/${product.id}`}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View details →
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
