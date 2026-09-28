import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from '../common/ProductCard';
import { getFlashSaleProducts } from '../../data/products';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  // Countdown Timer Logic
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 15 });

  useEffect(() => {
    loadSaleProducts();
  }, []);

  const loadSaleProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Take up to 5 products with a mock discount indicator
        const items = res.data.data.slice(0, 5).map((p, idx) => ({
          ...p,
          discount: [15, 20, 25, 30, 40][idx % 5],
          oldPrice: Math.round(Number(p.price) * 1.25)
        }));
        setProducts(items);
      } else {
        setProducts(getFlashSaleProducts());
      }
    } catch (e) {
      setProducts(getFlashSaleProducts());
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => time.toString().padStart(2, '0');

  return (
    <section className="py-12 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header section with elegant typography and timer */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-red-500"><Timer size={28} /></span>
                Flash Sale
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hurry up! Limited stock offers end in:</p>
            </div>
            
            {/* Professional Countdown Blocks */}
            <div className="flex items-center gap-2">
              <div className="bg-red-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                {formatTime(timeLeft.hours)}
              </div>
              <span className="text-red-500 font-bold">:</span>
              <div className="bg-red-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                {formatTime(timeLeft.minutes)}
              </div>
              <span className="text-red-500 font-bold">:</span>
              <div className="bg-red-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                {formatTime(timeLeft.seconds)}
              </div>
            </div>
          </div>

          <a href="#just-for-you" className="text-primary hover:text-orange-600 text-sm font-bold flex items-center gap-1 group">
            View All Offers <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Product Grid / Carousel Layout */}
        <div className="relative group/slider">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id || product.id} product={product} />
            ))}
          </div>
          
          {/* Mock Carousel Controls (for aesthetic purposes on desktop) */}
          <button className="absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/slider:opacity-100 transition-opacity xl:-left-5">
            <ChevronLeft size={20} />
          </button>
          <button className="absolute top-1/2 -right-4 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/slider:opacity-100 transition-opacity xl:-right-5">
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default FlashSale;
