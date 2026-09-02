import React, { useState } from 'react';
import ProductCard from '../common/ProductCard';
import { getJustForYouProducts } from '../../data/products';
import { Loader2 } from 'lucide-react';

const allProducts = getJustForYouProducts();
const PAGE_SIZE = 5;

const JustForYou = () => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const visibleProducts = allProducts.slice(0, visibleCount);
  const hasMore = visibleCount < allProducts.length;

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate network delay for a realistic feel
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, allProducts.length));
      setLoading(false);
    }, 600);
  };

  return (
    <section className="py-12 bg-[#fcfcfc] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        <div className="flex items-center justify-center mb-10 relative">
          <div className="absolute inset-x-0 h-px bg-gray-200 dark:bg-gray-700"></div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight bg-[#fcfcfc] dark:bg-gray-950 px-6 relative z-10">
            Just For You
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More / All Shown */}
        <div className="mt-12 flex flex-col items-center gap-3">
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-12 rounded-full transition-all duration-300 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More (${allProducts.length - visibleCount} more)`
              )}
            </button>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              ✓ You've seen all {allProducts.length} products
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Showing {visibleProducts.length} of {allProducts.length} products
          </p>
        </div>

      </div>
    </section>
  );
};

export default JustForYou;
