import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package } from 'lucide-react';

const API = 'http://localhost:5000/api';

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    if (user.role !== 'CUSTOMER') { navigate('/'); return; }
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      const res = await axios.get(`${API}/cart/${user.id}`);
      setItems(res.data.data || []);
      setCartTotal(res.data.cart_total || 0);
    } catch (err) {
      if (err.response?.status === 404) {
        setItems([]);
        setCartTotal(0);
      } else {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (cartItemId, newQty) => {
    try {
      await axios.put(`${API}/cart/${user.id}/items/${cartItemId}`, { quantity: newQty });
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`${API}/cart/${user.id}/items/${cartItemId}`);
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is waiting</h2>
            <p className="text-gray-500 mb-6">Please sign in to view your cart</p>
            <Link to="/login" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Sign In</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

        {error && <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse products and add them to your cart</p>
            <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.cart_item_id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex gap-5">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.primary_image ? (
                      <img src={item.primary_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{item.product_name}</h3>
                    <p className="text-sm text-gray-400 mt-1">Sold by {item.shop_name}</p>
                    <p className="text-lg font-extrabold text-primary mt-2">৳{Number(item.price).toLocaleString()}</p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button onClick={() => item.quantity > 1 && updateQty(item.cart_item_id, item.quantity - 1)}
                          className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 min-w-[40px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.cart_item_id, item.quantity + 1)}
                          className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.cart_item_id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">৳{Number(item.line_total).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sticky top-28">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="text-gray-900 dark:text-white font-bold">৳{Number(cartTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className="text-green-500 font-bold">Free</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-extrabold text-primary">৳{Number(cartTotal).toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/checkout" className="mt-6 w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={18} />
                </Link>
                <Link to="/" className="mt-3 w-full block text-center text-sm text-gray-500 hover:text-primary transition-colors">
                  Continue Shopping
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
