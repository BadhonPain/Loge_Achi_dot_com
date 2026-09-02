import React from 'react';
import Navbar from '../components/layout/Navbar';
import CategoryMenu from '../components/home/CategoryMenu';
import HeroSlider from '../components/home/HeroSlider';
import FlashSale from '../components/home/FlashSale';
import TopCategories from '../components/home/TopCategories';
import OfficialMall from '../components/home/OfficialMall';
import { Truck, ShieldCheck, HeadphonesIcon, CreditCard, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] font-sans selection:bg-primary/30 selection:text-primary">
      <Navbar />
      
      <main className="flex-1">
        {/* Bento Grid Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Category Menu */}
            <div className="hidden lg:block w-72 shrink-0">
              <CategoryMenu />
            </div>
            
            {/* Center: Main Slider */}
            <div className="flex-1 min-w-0">
              <HeroSlider />
            </div>
            
            {/* Right: Promo Banners */}
            <div className="hidden xl:flex flex-col w-72 shrink-0 gap-6">
              <div className="flex-1 rounded-2xl overflow-hidden relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gray-100">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-700" alt="Promo 1" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                <div className="absolute bottom-0 left-0 p-5">
                  <span className="text-primary text-xs font-bold tracking-wider mb-1 block">LIMITED OFFER</span>
                  <h3 className="text-white font-bold text-xl leading-tight mb-3">Smart<br/>Watches</h3>
                  <a href="#" className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 group/link">
                    Shop Now <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
              
              <div className="flex-1 rounded-2xl overflow-hidden relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-orange-100">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40 group-hover:scale-110 transition-transform duration-700" alt="Promo 2" />
                <div className="absolute inset-0 p-5 flex flex-col justify-center">
                  <h3 className="text-gray-900 font-bold text-2xl leading-tight mb-2">Sound<br/>Drops</h3>
                  <p className="text-gray-600 text-sm mb-4">Up to 30% off on premium audio.</p>
                  <div>
                    <button className="bg-gray-900 hover:bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Discover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Trust Features Section */}
        <section className="border-y border-gray-100 bg-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
              
              <div className="flex items-center gap-4 px-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-gray-700 transition-all duration-300">
                  <Truck size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Free Delivery</h4>
                  <p className="text-xs text-gray-500">From ৳5000</p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-gray-700 transition-all duration-300">
                  <CreditCard size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Safe Payment</h4>
                  <p className="text-xs text-gray-500">100% Secure</p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-gray-700 transition-all duration-300">
                  <ShieldCheck size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Buyer Protection</h4>
                  <p className="text-xs text-gray-500">Guaranteed</p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-gray-700 transition-all duration-300">
                  <HeadphonesIcon size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">24/7 Support</h4>
                  <p className="text-xs text-gray-500">Dedicated Team</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Level 3: Flash Sales Section */}
        <FlashSale />

        {/* Level 4: Top Categories */}
        <TopCategories />

        {/* Level 4: Official Brands / Top Vendors */}
        <OfficialMall />

      </main>
    </div>
  );
};

export default HomePage;
