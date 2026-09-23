'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, LogOut, User, Sparkles } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/products" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 text-lg leading-none">
              Nexgen Admin
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> v1.0
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Product Inventory System</p>
          </div>
        </Link>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-gray-50 border border-gray-200/80">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover bg-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden sm:block text-left pr-2">
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-gray-500 leading-tight">@{user.username}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:text-rose-600 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-lg transition-all shadow-sm"
              title="Log out of session"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
