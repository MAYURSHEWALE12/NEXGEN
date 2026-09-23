'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  initialValue: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ initialValue, onSearchChange, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const isFirstRender = useRef(true);

  // Synchronize internal state with URL prop changes (e.g. browser back/forward or external reset)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounce the user input to prevent excessive API calls
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearchChange(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, onSearchChange]);

  const handleClear = () => {
    setQuery('');
    onSearchChange('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products by title, brand, tag..."
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
        {isLoading && (
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
