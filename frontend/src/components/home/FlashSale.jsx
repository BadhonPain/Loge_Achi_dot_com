import { useState, useEffect } from 'react';
import { Timer, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from '../common/ProductCard';
import { getFlashSaleProducts } from '../../data/products';
import axios from 'axios';
import pujaSaleArtwork from '../../assets/Durga-Puja-Flash-Sale.png';

const API = 'http://localhost:5000/api';

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  // Countdown Timer Logic
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 15 });

  useEffect(() => {
    let active = true;
    axios.get(`${API}/products`)
      .then((res) => {
        if (!active) return;
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          // Take up to 5 products with a mock discount indicator
          const items = res.data.data.slice(0, 5).map((product, index) => ({
            ...product,
            discount: [15, 20, 25, 30, 40][index % 5],
            oldPrice: Math.round(Number(product.price) * 1.25)
          }));
          setProducts(items);
        } else {
          setProducts(getFlashSaleProducts());
        }
      })
      .catch(() => {
        if (active) setProducts(getFlashSaleProducts());
      });
    return () => { active = false; };
  }, []);

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

        <div className="relative isolate mb-10 aspect-[4/5] overflow-hidden rounded-2xl bg-[#190a09] shadow-[0_24px_70px_-34px_rgba(127,29,29,0.75)] sm:aspect-[5/3] lg:aspect-[16/9]">
          <img
            src={pujaSaleArtwork}
            alt="Durga Puja celebration artwork"
            className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#160706]/95 via-[#220907]/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#160706]/80 via-transparent to-[#160706]/10 sm:from-transparent" />
          <div className="relative z-10 flex h-full items-end p-6 sm:items-center sm:p-8 md:p-12 lg:p-16">
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-sm sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)]" />
                Durga Puja · Festival Sale
              </span>
              <h3 className="max-w-lg text-3xl font-black leading-tight text-white sm:text-4xl lg:text-6xl">
                Celebrate in <span className="text-amber-300">golden</span> style.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base lg:text-lg">
                Festive finds, thoughtful gifts, and special prices for every celebration.
              </p>
              <a
                href="#puja-offers"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-sm font-extrabold text-[#32120b] shadow-[0_8px_28px_-10px_rgba(252,211,77,0.85)] transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:mt-7"
              >
                Shop festive offers <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* Product Grid / Carousel Layout */}
        <div id="puja-offers" className="relative scroll-mt-28 group/slider">
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
