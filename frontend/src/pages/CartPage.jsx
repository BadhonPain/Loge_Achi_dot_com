import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package } from 'lucide-react';

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, cartTotal, loading, updateQuantity, removeItem, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      fetchCart();
    } else if (user && user.role !== 'CUSTOMER') {
      navigate('/');
    }
  }, [user]);

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your cart is waiting</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Please sign in with your customer account to view or add items to your cart.</p>
            <Link to="/login?role=customer" className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors inline-block shadow-lg shadow-primary/25">
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
          <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3.5 py-1.5 rounded-full">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {loading && cartItems.length === 0 ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-sm mx-auto">Looks like you haven't added any items to your shopping cart yet.</p>
            <Link to="/" className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors inline-block shadow-lg shadow-primary/25">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.cart_item_id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row gap-5 shadow-sm hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800">
                    {item.primary_image ? (
                      <img src={item.primary_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Merchant: <span className="text-gray-600 dark:text-gray-300 font-medium">{item.shop_name || 'Verified Vendor'}</span></p>
                    <p className="text-lg font-black text-primary mt-2">৳{Number(item.price).toLocaleString()}</p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/80 min-w-[36px] text-center border-x border-gray-200 dark:border-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.cart_item_id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1 text-xs font-semibold"
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right flex-shrink-0 sm:border-l sm:border-gray-100 dark:sm:border-gray-800 sm:pl-5 sm:flex sm:flex-col sm:justify-center">
                    <span className="text-xs text-gray-400 block sm:mb-1">Subtotal</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white">৳{Number(item.line_total).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sticky top-28 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Items Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-bold">৳{Number(cartTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Estimated Shipping</span>
                    <span className="text-green-600 font-bold">Free</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between">
                    <span className="text-base font-black text-gray-900 dark:text-white">Grand Total</span>
                    <span className="text-xl font-black text-primary">৳{Number(cartTotal).toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </Link>

                <Link to="/" className="mt-3 w-full block text-center text-xs font-semibold text-gray-500 hover:text-primary transition-colors py-2">
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
