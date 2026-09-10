import React, { useContext, useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, Heart, LogOut, Moon, Sun, Shield, Package, LayoutDashboard, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggle } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      axios.get(`http://localhost:5000/api/cart/${user.id}`)
        .then(res => {
          setCartCount(res.data.count || res.data.data?.length || 0);
          setCartTotal(res.data.cart_total || 0);
        })
        .catch(() => {
          setCartCount(0);
          setCartTotal(0);
        });
    } else {
      setCartCount(0);
      setCartTotal(0);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  // Role-based dashboard link
  const dashboardLink = user?.role === 'ADMIN' ? '/admin' : user?.role === 'SELLER' ? '/seller-dashboard' : null;

  return (
    <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      {/* Top Utility Bar */}
      <div className="bg-gray-900 dark:bg-gray-950 text-gray-300 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex gap-6 tracking-wide">
            <Link to="/seller" className="hover:text-white transition-colors">Become a Vendor</Link>
            <Link to="/orders" className="hover:text-white transition-colors">Track Order</Link>
          </div>
          <div className="flex gap-6 tracking-wide">
            {user && <span className="text-primary font-medium">{user.role} Account</span>}
            <span>ENG / BDT</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">

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
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-primary/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-primary/10 pl-11 pr-24 py-3 rounded-full outline-none transition-all duration-300 text-sm font-medium text-gray-900 dark:text-white"
            />
            <button className="absolute inset-y-1.5 right-1.5 bg-gray-900 dark:bg-primary hover:bg-primary text-white px-5 rounded-full text-sm font-medium transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Dark Mode Toggle */}
          <button onClick={toggle} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" title={isDark ? 'Light Mode' : 'Dark Mode'}>
            {isDark ? <Sun size={22} strokeWidth={1.5} /> : <Moon size={22} strokeWidth={1.5} />}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors hidden sm:block">
            <Heart size={22} strokeWidth={1.5} />
          </Link>

          {/* User Auth */}
          <div className="relative">
            {user ? (
              <div>
                <button className="flex items-center gap-2 group" onClick={() => setShowDropdown(!showDropdown)}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block group-hover:text-primary transition-colors">
                    Hi, {user.name?.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute top-12 right-0 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{user.role}</span>
                      </div>

                      {/* Role-specific Dashboard */}
                      {dashboardLink && (
                        <Link to={dashboardLink} onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary">
                          {user.role === 'ADMIN' ? <Shield size={16} /> : <LayoutDashboard size={16} />}
                          {user.role === 'ADMIN' ? 'Admin Panel' : 'Seller Dashboard'}
                        </Link>
                      )}

                      {user.role === 'CUSTOMER' && (
                        <>
                          <Link to="/orders" onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary">
                            <Package size={16} /> My Orders
                          </Link>
                          <Link to="/wishlist" onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary">
                            <Heart size={16} /> Wishlist
                          </Link>
                        </>
                      )}

                      <button onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                <User size={22} strokeWidth={1.5} />
              </Link>
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

          {/* Mobile Menu */}
          <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setShowMobile(!showMobile)}>
            {showMobile ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobile && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-sm" />
          </div>
          <Link to="/wishlist" onClick={() => setShowMobile(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 text-sm"><Heart size={18} /> Wishlist</Link>
          <Link to="/orders" onClick={() => setShowMobile(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 text-sm"><Package size={18} /> Orders</Link>
          <Link to="/seller" onClick={() => setShowMobile(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 text-sm"><LayoutDashboard size={18} /> Become a Vendor</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
