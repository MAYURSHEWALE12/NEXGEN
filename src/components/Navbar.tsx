'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Box, ChevronRight } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/products" className="flex items-center gap-2 font-semibold text-zinc-900 text-sm tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center text-white">
              <Box className="w-4 h-4" />
            </div>
            <span>StoreAdmin</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-xs font-medium text-zinc-600">Products</span>
        </div>

        {/* Right: User details & Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.username}
                  className="w-6 h-6 rounded-full border border-zinc-200 object-cover bg-zinc-100"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-medium">
                  {user.firstName?.[0] || 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-zinc-800 hidden sm:inline">
                {user.firstName} {user.lastName}
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors border border-zinc-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
