import React, { useEffect, useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package, Tag, ShieldCheck, AlertTriangle } from 'lucide-react';

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, cartTotal, loading, updateQuantity, removeItem, fetchCart } = useContext(CartContext);
  const [promoCode, setPromoCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      fetchCart();
    } else if (user && user.role !== 'CUSTOMER') {
      navigate('/');
    }
  }, [user]);

  const handleUpdateQty = async (cartItemId, newQty, productName) => {
    if (newQty <= 0) {
      await removeItem(cartItemId);
      toast.info(`Removed "${productName}" from cart`, { icon: '🗑️' });
      return;
    }
    await updateQuantity(cartItemId, newQty);
    toast.info('Cart quantity updated', { autoClose: 1000 });
  };

  const handleRemove = async (cartItemId, productName) => {
    await removeItem(cartItemId);
    toast.info(`Removed "${productName}" from cart`, { icon: '🗑️' });
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.warn('Please enter a valid promo code');
      return;
    }
    toast.info(`Promo code "${promoCode.toUpperCase()}" is expired or invalid`);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card bg-white dark:bg-gray-900 max-w-md p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your cart is waiting</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Please sign in with your customer account to view or add items to your cart.</p>
            <Link to="/login?role=customer" className="btn btn-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25">
              Sign In to Your Account
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review your selected items before checking out</p>
          </div>
          <span className="badge badge-primary badge-outline font-bold px-3 py-2 text-xs">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {loading && cartItems.length === 0 ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-sm mx-auto">Looks like you haven't added any items to your shopping cart yet.</p>
            <div>
              <Link to="/" className="btn btn-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 px-8">
                Explore Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
              {/* Out-of-stock cart warning banner */}
              {cartItems.some(item => item.status !== 'ACTIVE' || item.quantity > item.stock_quantity) && (
                <div className="alert alert-warning text-warning-content text-sm font-medium shadow-sm rounded-xl">
                  <AlertTriangle size={18} />
                  <span>Some items in your cart are out of stock or unavailable. Remove them to proceed to checkout.</span>
                </div>
              )}
              {cartItems.map(item => {
                const isUnavailable = item.status !== 'ACTIVE' || item.quantity > item.stock_quantity;
                return (
                <div key={item.cart_item_id} className={`card bg-white dark:bg-gray-900 rounded-2xl border-2 p-5 flex flex-col sm:flex-row gap-5 shadow-sm hover:shadow-md transition-shadow ${isUnavailable ? 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-950/10' : 'border-gray-100 dark:border-gray-800'}`}>
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800 relative">
                    {item.primary_image ? (
                      <img src={item.primary_image} alt={item.product_name} className={`w-full h-full object-cover ${isUnavailable ? 'opacity-40 grayscale' : ''}`} />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                        <span className="text-white text-[10px] font-black uppercase tracking-wider">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${item.product_id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                        {item.product_name}
                      </Link>
                      {isUnavailable && (
                        <span className="badge badge-error badge-sm text-white font-bold shrink-0 gap-1">
                          <AlertTriangle size={10} /> Unavailable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Merchant: <span className="badge badge-ghost badge-sm text-[11px] font-medium ml-1">{item.shop_name || 'Verified Vendor'}</span>
                    </p>
                    <p className="text-lg font-black text-primary mt-2">৳{Number(item.price).toLocaleString()}</p>
                    {isUnavailable && item.stock_quantity === 0 && (
                      <p className="text-xs text-red-500 font-semibold mt-1">This product is currently out of stock</p>
                    )}
                    {isUnavailable && item.stock_quantity > 0 && item.quantity > item.stock_quantity && (
                      <p className="text-xs text-red-500 font-semibold mt-1">Only {item.stock_quantity} left — reduce quantity</p>
                    )}

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1, item.product_name)}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 transition-colors"
                          title="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="inline-flex items-center justify-center px-3 h-8 text-xs font-bold text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700 select-none min-w-[34px]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1, item.product_name)}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 transition-colors"
                          title="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.cart_item_id, item.product_name)}
                        className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right flex-shrink-0 sm:border-l sm:border-gray-100 dark:sm:border-gray-800 sm:pl-5 sm:flex sm:flex-col sm:justify-center">
                    <span className="text-xs text-gray-400 block sm:mb-1">Item Total</span>
                    <p className={`text-lg font-black ${isUnavailable ? 'text-red-400 line-through' : 'text-gray-900 dark:text-white'}`}>৳{Number(item.line_total).toLocaleString()}</p>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sticky top-28 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Items Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-bold">৳{Number(cartTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Estimated Shipping</span>
                    <span className="badge badge-success badge-sm text-white font-bold">FREE</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-black text-gray-900 dark:text-white">Grand Total</span>
                    <span className="text-2xl font-black text-primary">৳{Number(cartTotal).toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="mt-5">
                  <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:border-primary transition-colors">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo / Voucher Code"
                      className="flex-1 px-3 py-2 text-xs bg-transparent text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
                    />
                    <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-black text-white text-xs font-bold transition-colors">
                      Apply
                    </button>
                  </div>
                </form>

                {(() => {
                  const hasUnavailable = cartItems.some(item => item.status !== 'ACTIVE' || item.quantity > item.stock_quantity);
                  return hasUnavailable ? (
                    <div className="mt-6">
                      <button
                        disabled
                        className="w-full text-white font-bold h-12 rounded-xl bg-gray-400 dark:bg-gray-600 flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
                      >
                        <AlertTriangle size={18} />
                        <span>Remove Unavailable Items</span>
                      </button>
                      <p className="text-xs text-red-500 font-medium text-center mt-2">
                        Please remove out-of-stock items to continue
                      </p>
                    </div>
                  ) : (
                    <Link
                      to="/checkout"
                      className="w-full mt-6 text-white font-bold h-12 rounded-xl bg-primary hover:bg-orange-600 active:scale-[0.99] shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={18} />
                    </Link>
                  );
                })()}

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>Safe & Secure 256-Bit SSL Checkout</span>
                </div>

                <Link to="/" className="mt-2 w-full block text-center text-xs font-semibold text-gray-500 hover:text-primary transition-colors py-2">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
