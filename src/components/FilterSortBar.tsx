'use client';

import React from 'react';
import { CategoryItem } from '@/types';
import { Filter, ArrowUpDown, RotateCcw } from 'lucide-react';

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
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Dropdown */}
      <div className="relative min-w-[160px] sm:min-w-[180px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div className="relative min-w-[140px] sm:min-w-[160px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, order)}
          className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer"
        >
          <option value="">Default Sorting</option>
          <option value="title">Title</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort Direction Toggle Button */}
      {sortBy && (
        <button
          type="button"
          onClick={() => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          title={`Order: ${order === 'asc' ? 'Ascending' : 'Descending'}`}
        >
          <span>{order === 'asc' ? 'Asc (↑)' : 'Desc (↓)'}</span>
        </button>
      )}

      {/* Reset Filter Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
