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

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearchChange(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, onSearchChange]);

  const handleClear = () => {
    setQuery('');
    onSearchChange('');
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter products..."
        className="w-full pl-9 pr-8 py-1.5 bg-white border border-zinc-300 rounded-md text-sm placeholder-zinc-400 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors shadow-xs"
      />
      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
        {isLoading && (
          <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
        )}
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-zinc-400 hover:text-zinc-600 p-0.5"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
