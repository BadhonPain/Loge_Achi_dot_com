import React from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Banner (Optional, for app download or vendor signup) */}
      <div className="bg-gray-100 text-xs text-gray-600 py-1 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
            <Link to="/seller" className="hover:text-primary transition-colors">Become a Seller</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Help & Support</Link>
          </div>
          <div className="flex gap-4">
            <span>Save More on App</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 min-w-fit">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            LA
          </div>
          <span className="text-2xl font-bold text-primary hidden sm:block tracking-tight">Loge Achi</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex">
          <div className="relative w-full flex">
            <input 
              type="text" 
              placeholder="Search in Loge Achi" 
              className="w-full bg-gray-100 border border-transparent focus:border-primary focus:bg-white px-4 py-2 rounded-l-md outline-none transition-colors"
            />
            <button className="bg-primary hover:bg-orange-600 text-white px-6 rounded-r-md transition-colors flex items-center justify-center">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Actions (Cart & User) */}
        <div className="flex items-center gap-6">
          <Link to="/login" className="flex items-center gap-2 hover:text-primary transition-colors text-gray-700 font-medium">
            <User size={24} />
            <span className="hidden lg:block">Login / Sign Up</span>
          </Link>
          
          <Link to="/cart" className="flex items-center gap-2 hover:text-primary transition-colors relative text-gray-700">
            <ShoppingCart size={24} />
            {/* Cart Badge */}
            <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              0
            </span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700 hover:text-primary">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Shows only on small screens) */}
      <div className="p-3 md:hidden border-t">
        <div className="relative w-full flex">
          <input 
            type="text" 
            placeholder="Search in Loge Achi" 
            className="w-full bg-gray-100 border border-transparent focus:border-primary focus:bg-white px-4 py-2 rounded-l-md outline-none text-sm"
          />
          <button className="bg-primary text-white px-4 rounded-r-md flex items-center justify-center">
            <Search size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
