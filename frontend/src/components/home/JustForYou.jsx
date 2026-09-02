import React from 'react';
import ProductCard from '../common/ProductCard';
import { getJustForYouProducts } from '../../data/products';

const products = getJustForYouProducts();

const JustForYou = () => {
  return (
    <section className="py-12 bg-[#fcfcfc]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex items-center justify-center mb-10 relative">
          <div className="absolute inset-x-0 h-px bg-gray-200"></div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight bg-[#fcfcfc] px-6 relative z-10">
            Just For You
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-12 rounded-full transition-colors duration-300">
            Load More
          </button>
        </div>

      </div>
    </section>
  );
};

export default JustForYou;
