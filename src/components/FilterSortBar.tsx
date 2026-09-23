'use client';

import React from 'react';
import { CategoryItem } from '@/types';
import { ArrowDownUp, RotateCcw } from 'lucide-react';

interface FilterSortBarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  sortBy: string;
  order: 'asc' | 'desc';
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  onReset: () => void;
  isFiltered: boolean;
}

export function FilterSortBar({
  categories,
  selectedCategory,
  sortBy,
  order,
  onCategoryChange,
  onSortChange,
  onReset,
  isFiltered,
}: FilterSortBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category Dropdown */}
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className="pl-3 pr-8 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 shadow-xs cursor-pointer hover:bg-zinc-50"
        >
          <option value="all">Category: All</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-zinc-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, order)}
          aria-label="Sort by field"
          className="pl-3 pr-8 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-800 appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 shadow-xs cursor-pointer hover:bg-zinc-50"
        >
          <option value="">Sort: Default</option>
          <option value="title">Sort: Title</option>
          <option value="price">Sort: Price</option>
          <option value="rating">Sort: Rating</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-zinc-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Direction Toggle */}
      {sortBy && (
        <button
          type="button"
          onClick={() => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition-colors"
          title={`Order: ${order === 'asc' ? 'Ascending' : 'Descending'}`}
        >
          <ArrowDownUp className="w-3 h-3 text-zinc-500" />
          <span>{order === 'asc' ? 'Asc' : 'Desc'}</span>
        </button>
      )}

      {/* Reset */}
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
