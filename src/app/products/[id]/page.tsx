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
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  AlertCircle,
  Loader2,
  Calendar,
  UserCheck,
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

    // If product was locally deleted
    if (locallyDeletedIds.includes(productId)) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    // If product is in locallyAdded
    const localItem = locallyAdded.find((p) => p.id === productId);
    if (localItem) {
      const merged = { ...localItem, ...(locallyUpdated[productId] || {}) };
      setProduct(merged);
      setSelectedImage(merged.thumbnail || merged.images?.[0] || '');
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from DummyJSON API
    const abortController = new AbortController();
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);

    productService
      .getProductById(productId, abortController.signal)
      .then((data) => {
        // Merge with local updates if any
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-600">Loading product details...</p>
          </div>
        )}

        {/* Not Found State (404 for wrong ID) */}
        {!isLoading && isNotFound && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
            <p className="text-sm text-gray-500 max-w-md mt-2 mb-6">
              The product you are looking for (ID: #{rawId}) does not exist or has been removed from the inventory.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        )}

        {/* Error State */}
        {!isLoading && !isNotFound && error && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-rose-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Failed to load product</h2>
            <p className="text-sm text-gray-500 max-w-md mt-2 mb-6">{error}</p>
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              <span>Reload Page</span>
            </button>
          </div>
        )}

        {/* Product Details Content */}
        {!isLoading && !isNotFound && product && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Image Gallery */}
              <div className="lg:col-span-5 flex flex-col items-center">
                {/* Main View */}
                <div className="w-full aspect-square bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={selectedImage || product.thumbnail}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/400x400?text=Product+Image';
                    }}
                  />
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="absolute top-4 left-4 bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                      {Math.round(product.discountPercentage)}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnails list */}
                {product.images && product.images.length > 1 && (
                  <div className="flex items-center gap-2.5 mt-4 overflow-x-auto w-full pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`w-16 h-16 rounded-xl border-2 p-1 bg-gray-50 shrink-0 overflow-hidden transition-all ${
                          selectedImage === img
                            ? 'border-indigo-600 shadow-sm shadow-indigo-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Product Metadata */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                      <Tag className="w-3.5 h-3.5" />
                      {product.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                      Brand: {product.brand || 'Generic'}
                    </span>
                    {product.sku && (
                      <span className="text-xs text-gray-400 font-mono">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                    {product.title}
                  </h1>

                  {/* Rating & Stock row */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-900">
                        {product.rating ? product.rating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-[11px] text-amber-700">/ 5.0</span>
                    </div>

                    <div className="text-xs">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Package className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price info */}
                  <div className="mt-5 pb-5 border-b border-gray-100">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Policies & Benefits Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">Warranty</p>
                      <p className="text-[10px] text-gray-500">
                        {product.warrantyInformation || '1 Year Standard'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">Shipping</p>
                      <p className="text-[10px] text-gray-500">
                        {product.shippingInformation || 'Ships in 1-2 days'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <RotateCcw className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">Return Policy</p>
                      <p className="text-[10px] text-gray-500">
                        {product.returnPolicy || '30 days return'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verified feedback from real customers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-gray-900">
                    {product.reviews?.length || 0}
                  </span>
                  <span className="text-xs text-gray-500">reviews</span>
                </div>
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex flex-col justify-between"
                    >
                      <div>
                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        {/* Comment */}
                        <p className="text-xs text-gray-800 leading-relaxed font-medium">
                          "{review.comment}"
                        </p>
                      </div>

                      {/* Reviewer Info */}
                      <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center justify-between text-[11px] text-gray-500">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{review.reviewerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>
                            {new Date(review.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No reviews available yet for this item.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
