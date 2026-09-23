'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { useProductsContext } from '@/context/ProductContext';
import { Navbar } from '@/components/Navbar';
import {
  ArrowLeft,
  Star,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locallyUpdated, locallyDeletedIds, locallyAdded } = useProductsContext();

  const rawId = params?.id as string;
  const productId = Number(rawId);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawId || isNaN(productId)) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    if (locallyDeletedIds.includes(productId)) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    const localItem = locallyAdded.find((p) => p.id === productId);
    if (localItem) {
      const merged = { ...localItem, ...(locallyUpdated[productId] || {}) };
      setProduct(merged);
      setSelectedImage(merged.thumbnail || merged.images?.[0] || '');
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);

    productService
      .getProductById(productId, abortController.signal)
      .then((data) => {
        const finalData = locallyUpdated[productId]
          ? { ...data, ...locallyUpdated[productId] }
          : data;
        setProduct(finalData);
        setSelectedImage(finalData.thumbnail || finalData.images?.[0] || '');
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (err.status === 404 || err.message?.includes('not found')) {
          setIsNotFound(true);
        } else {
          setError(err.message || 'Failed to load product details.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => abortController.abort();
  }, [rawId, productId, locallyAdded, locallyUpdated, locallyDeletedIds]);

  return (
    <div className="min-h-screen bg-zinc-50/60 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-4">
        {/* Breadcrumb / Back button */}
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to products</span>
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-zinc-200">
            <Loader2 className="w-6 h-6 text-zinc-600 animate-spin mb-2" />
            <p className="text-xs text-zinc-500">Loading product details...</p>
          </div>
        )}

        {/* 404 Not Found */}
        {!isLoading && isNotFound && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-lg border border-zinc-200">
            <div className="w-10 h-10 rounded-md bg-zinc-100 flex items-center justify-center mb-3 text-zinc-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Product not found</h2>
            <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
              The product with ID #{rawId} does not exist or has been removed.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
            >
              Return to dashboard
            </Link>
          </div>
        )}

        {/* Error */}
        {!isLoading && !isNotFound && error && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-lg border border-red-200">
            <p className="text-xs text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.refresh()}
              className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isNotFound && product && (
          <div className="space-y-4">
            {/* Overview Card */}
            <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Image Gallery */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full aspect-square bg-zinc-50 rounded-md border border-zinc-200 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedImage || product.thumbnail}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image';
                    }}
                  />
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="flex items-center gap-2 mt-3 overflow-x-auto w-full pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`w-12 h-12 rounded border p-0.5 bg-zinc-50 shrink-0 overflow-hidden ${
                          selectedImage === img ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
                      {product.category}
                    </span>
                    <span className="text-xs text-zinc-500 capitalize">
                      {product.brand || 'Generic'}
                    </span>
                    {product.sku && (
                      <span className="text-[11px] text-zinc-400 font-mono ml-auto">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg font-bold text-zinc-900 leading-snug">
                    {product.title}
                  </h1>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating ? product.rating.toFixed(1) : '-'} / 5.0</span>
                    </div>
                    <span className="text-zinc-300">•</span>
                    <span className="text-xs text-zinc-600">
                      {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="mt-4 pb-4 border-b border-zinc-100">
                    <span className="text-2xl font-bold font-mono text-zinc-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <span className="ml-2 text-xs text-zinc-400 font-normal">
                        ({Math.round(product.discountPercentage)}% discount)
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                      Description
                    </h2>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Specs footer */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Warranty</span>
                    <span className="font-medium text-zinc-800">{product.warrantyInformation || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Shipping</span>
                    <span className="font-medium text-zinc-800">{product.shippingInformation || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Returns</span>
                    <span className="font-medium text-zinc-800">{product.returnPolicy || '30 days'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg border border-zinc-200 p-5 shadow-xs">
              <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100">
                Customer Reviews ({product.reviews?.length || 0})
              </h2>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md bg-zinc-50 border border-zinc-200/80 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-0.5 mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-zinc-800 font-medium">"{review.comment}"</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-zinc-200/50 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>{review.reviewerName}</span>
                        <span>{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No reviews recorded.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
