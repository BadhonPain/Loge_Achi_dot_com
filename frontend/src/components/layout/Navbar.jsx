import React, { useContext, useState } from 'react';
import { Search, ShoppingBag, User, Menu, Heart, LogOut, Moon, Sun, Shield, Package, LayoutDashboard, X, Store, Sparkles, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CartContext } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggle } = useTheme();
  const { cartCount, cartTotal } = useContext(CartContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  // Role-based dashboard link
  const dashboardLink = user?.role === 'ADMIN' ? '/admin' : user?.role === 'SELLER' ? '/seller-dashboard' : null;

  return (
    <header className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors">
      {/* Top Utility Bar */}
      <div className="bg-gray-900 dark:bg-gray-950 text-gray-300 text-xs py-2 hidden md:block border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Left Portal Shortcuts */}
          <div className="flex gap-6 items-center tracking-wide">
            <Link to="/seller" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
              <Store size={13} className="text-primary" /> Become a Vendor
            </Link>
            <span className="text-gray-700 dark:text-gray-800">|</span>
            <Link 
              to={user?.role === 'SELLER' ? '/seller-dashboard' : '/login?role=seller'} 
              className="hover:text-orange-400 transition-colors flex items-center gap-1.5 font-medium"
            >
              <LayoutDashboard size={13} className="text-orange-400" /> Seller Portal
            </Link>
            <span className="text-gray-700 dark:text-gray-800">|</span>
            <Link 
              to={user?.role === 'ADMIN' ? '/admin' : '/login?role=admin'} 
              className="hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Shield size={13} className="text-red-400" /> Admin Control
            </Link>
          </div>

          {/* Right Status */}
          <div className="flex gap-6 items-center tracking-wide">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Signed in as:</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  user.role === 'ADMIN'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : user.role === 'SELLER'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    : 'bg-green-500/20 text-green-400 border-green-500/40'
                }`}>
                  {user.role}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
                <span>/</span>
                <Link to="/signup" className="text-primary hover:underline font-bold">
                  Register
                </Link>
              </div>
            )}
            <span className="text-gray-700 dark:text-gray-800">|</span>
            <span>ENG / BDT</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-white font-black text-xl tracking-tighter italic">LA</span>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full transition-colors"></div>
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <span className="text-2xl font-black tracking-tighter leading-none text-gray-900 dark:text-white transition-colors">
              Loge<span className="text-primary">Achi</span><span className="text-gray-400 dark:text-gray-500 text-lg">.com</span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase leading-none mt-1 transition-colors">
              The Premium Marketplace
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for products, brands, or vendors..."
              className="w-full bg-gray-50/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:border-primary/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-primary/10 pl-11 pr-24 py-3 rounded-full outline-none transition-all duration-300 text-sm font-medium text-gray-900 dark:text-white"
            />
            <button className="absolute inset-y-1.5 right-1.5 bg-gray-900 dark:bg-primary hover:bg-primary text-white px-5 rounded-full text-sm font-medium transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggle} 
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800" 
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={22} strokeWidth={1.5} /> : <Moon size={22} strokeWidth={1.5} />}
          </button>

          {/* Wishlist */}
          <Link 
            to="/wishlist" 
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors hidden sm:block rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Wishlist"
          >
            <Heart size={22} strokeWidth={1.5} />
          </Link>

          {/* User Auth Dropdown */}
          <div className="relative">
            {user ? (
              <div>
                <button 
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${
                    user.role === 'ADMIN'
                      ? 'bg-red-500 text-white'
                      : user.role === 'SELLER'
                      ? 'bg-orange-500 text-white'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {user.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">{user.role}</span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 hidden lg:block" />
                </button>

                {/* Dropdown Menu (Logged in) */}
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute top-12 right-0 w-60 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <span className={`inline-block mt-2 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : user.role === 'SELLER'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        }`}>
                          {user.role} Account
                        </span>
                      </div>

                      {/* Role-specific Dashboard Links */}
                      {user.role === 'ADMIN' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          <Shield size={16} /> Admin Control Center
                        </Link>
                      )}

                      {user.role === 'SELLER' && (
                        <Link 
                          to="/seller-dashboard" 
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 font-semibold hover:bg-orange-50 dark:hover:bg-orange-950/50"
                        >
                          <LayoutDashboard size={16} /> Seller Dashboard
                        </Link>
                      )}

                      {user.role === 'CUSTOMER' && (
                        <>
                          <Link 
                            to="/orders" 
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary"
                          >
                            <Package size={16} /> My Orders
                          </Link>
                          <Link 
                            to="/cart" 
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary"
                          >
                            <ShoppingBag size={16} /> My Cart ({cartCount})
                          </Link>
                          <Link 
                            to="/wishlist" 
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary"
                          >
                            <Heart size={16} /> Wishlist
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
                  title="Sign In Portals"
                >
                  <User size={22} strokeWidth={1.5} />
                  <ChevronDown size={12} className="text-gray-400" />
                </button>

                {/* Dropdown for Guest / Login choices */}
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Choose Sign In Portal</p>
                      </div>

                      <Link
                        to="/login?role=customer"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary font-medium"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 flex items-center justify-center shrink-0">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-bold leading-none">Customer Login</p>
                          <p className="text-[10px] text-gray-400 mt-1">Shop & track your orders</p>
                        </div>
                      </Link>

                      <Link
                        to="/login?role=seller"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-orange-500 font-medium"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950 text-orange-600 flex items-center justify-center shrink-0">
                          <Store size={16} />
                        </div>
                        <div>
                          <p className="font-bold leading-none">Seller / Vendor Portal</p>
                          <p className="text-[10px] text-gray-400 mt-1">Manage store & inventory</p>
                        </div>
                      </Link>

                      <Link
                        to="/login?role=admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-500 font-medium"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center shrink-0">
                          <Shield size={16} />
                        </div>
                        <div>
                          <p className="font-bold leading-none">Admin Portal</p>
                          <p className="text-[10px] text-gray-400 mt-1">Governance & oversight</p>
                        </div>
                      </Link>

                      <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                      <Link
                        to="/signup"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center justify-center gap-2 mx-3 my-1 py-2 text-xs font-bold text-white bg-primary hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-primary/20"
                      >
                        <Sparkles size={14} /> Create Free Account
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors relative flex items-center gap-2">
            <div className="relative">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 animate-scaleIn">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left ml-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">Your Cart</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">৳{Number(cartTotal).toLocaleString()}</p>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setShowMobile(!showMobile)}>
            {showMobile ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobile && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3 animate-fadeIn">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-sm" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Link 
              to="/login?role=customer" 
              onClick={() => setShowMobile(false)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold"
            >
              <User size={16} className="text-green-500 mb-1" /> Customer
            </Link>
            <Link 
              to="/login?role=seller" 
              onClick={() => setShowMobile(false)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold"
            >
              <Store size={16} className="text-orange-500 mb-1" /> Seller
            </Link>
            <Link 
              to="/login?role=admin" 
              onClick={() => setShowMobile(false)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold"
            >
              <Shield size={16} className="text-red-500 mb-1" /> Admin
            </Link>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-2 space-y-1">
            <Link to="/wishlist" onClick={() => setShowMobile(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium"><Heart size={18} /> Wishlist</Link>
            <Link to="/orders" onClick={() => setShowMobile(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium"><Package size={18} /> Orders</Link>
            <Link to="/seller" onClick={() => setShowMobile(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium"><Store size={18} /> Become a Vendor</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
