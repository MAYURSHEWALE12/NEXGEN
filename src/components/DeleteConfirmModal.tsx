'use client';

import React from 'react';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl border border-zinc-200 relative animate-in fade-in zoom-in-98 duration-150">
        <h3 className="text-sm font-semibold text-zinc-900">Delete product</h3>
        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
          Are you sure you want to delete <strong className="text-zinc-800 font-medium">"{product.title}"</strong>? This will remove the item from your current view.
        </p>

        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 rounded-md border border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
