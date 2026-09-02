import React from 'react';
import ProductCard from '../common/ProductCard';

// Dummy data for Just For You
const products = [
  { id: 1, title: 'Men\'s Casual Fit T-Shirt', category: 'Fashion', price: 850, rating: 4, reviews: 12, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop' },
  { id: 2, title: 'Wireless Bluetooth Earbuds 5.0', category: 'Electronics', price: 1200, discount: 20, rating: 5, reviews: 304, image: 'https://images.unsplash.com/photo-1572569433602-66665044ab49?q=80&w=400&auto=format&fit=crop' },
  { id: 3, title: 'Non-stick Frying Pan Set', category: 'Home & Kitchen', price: 2500, oldPrice: 3000, rating: 4, reviews: 85, image: 'https://images.unsplash.com/photo-1584990347449-a6efa1a200d9?q=80&w=400&auto=format&fit=crop' },
  { id: 4, title: 'Vitamin C Face Serum 30ml', category: 'Health & Beauty', price: 1500, rating: 5, reviews: 1020, isNew: true, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop' },
  { id: 5, title: 'Mechanical Gaming Keyboard RGB', category: 'Computing', price: 3500, discount: 15, rating: 5, reviews: 450, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop' },
  { id: 6, title: 'Yoga Mat with Carrying Strap', category: 'Sports', price: 900, rating: 4, reviews: 67, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400&auto=format&fit=crop' },
  { id: 7, title: 'Smart LED TV 43 Inch 4K UHD', category: 'TV & Home Appliances', price: 28000, oldPrice: 32000, rating: 4, reviews: 21, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop' },
  { id: 8, title: 'Premium Coffee Beans 1kg Arabica', category: 'Groceries', price: 1800, rating: 5, reviews: 540, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop' },
  { id: 9, title: 'Men\'s Leather Wallet Slim Design', category: 'Accessories', price: 1200, discount: 10, rating: 4, reviews: 34, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop' },
  { id: 10, title: 'Ceramic Table Lamp Modern', category: 'Home Decor', price: 4500, rating: 5, reviews: 11, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400&auto=format&fit=crop' },
];

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
