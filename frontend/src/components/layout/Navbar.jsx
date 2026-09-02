import React from 'react';
import { Search, ShoppingBag, User, Menu, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100">
      {/* Top Utility Bar - Very subtle */}
      <div className="bg-gray-900 text-gray-300 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex gap-6 tracking-wide">
            <Link to="/seller" className="hover:text-white transition-colors">Become a Vendor</Link>
            <Link to="/track" className="hover:text-white transition-colors">Track Order</Link>
          </div>
          <div className="flex gap-6 tracking-wide">
            <span>ENG / BDT</span>
            <span>Support</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        
        {/* Elegant Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-orange-500/30">
            L
          </div>
          <span className="text-2xl font-extrabold tracking-tighter text-gray-900 hidden sm:block">
            Loge<span className="text-primary">Achi</span>.
          </span>
        </Link>

        {/* Sleek Search Bar */}
        <div className="flex-1 max-w-3xl hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search for products, brands, or vendors..." 
              className="w-full bg-gray-50/50 border border-gray-200 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 pl-11 pr-24 py-3 rounded-full outline-none transition-all duration-300 text-sm font-medium"
            />
            <button className="absolute inset-y-1.5 right-1.5 bg-gray-900 hover:bg-primary text-white px-5 rounded-full text-sm font-medium transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Minimalist Actions */}
        <div className="flex items-center gap-5 shrink-0">
          <Link to="/wishlist" className="p-2 text-gray-600 hover:text-primary transition-colors">
            <Heart size={22} strokeWidth={1.5} />
          </Link>
          
          <Link to="/account" className="p-2 text-gray-600 hover:text-primary transition-colors">
            <User size={22} strokeWidth={1.5} />
          </Link>
          
          <Link to="/cart" className="p-2 text-gray-600 hover:text-primary transition-colors relative flex items-center gap-2">
            <div className="relative">
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
                3
              </span>
            </div>
            <div className="hidden lg:block text-left ml-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">Your Cart</p>
              <p className="text-sm font-bold text-gray-900 leading-none">৳0.00</p>
            </div>
          </Link>
          
          <button className="md:hidden p-2 text-gray-600">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
