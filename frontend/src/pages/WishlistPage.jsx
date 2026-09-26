import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { products as dummyCatalog } from '../data/products';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  // Initialize with a couple of top picks for a lively UI experience
  const [wishlistItems, setWishlistItems] = useState([
    dummyCatalog[0], // Sony WH-1000XM5
    dummyCatalog[1], // Samsung Galaxy S24 Ultra
  ]);

  const handleAddToCart = async (item) => {
    if (!user) {
      toast.warn('Please sign in to add items to your cart');
      return;
    }
    const res = await addToCart(item.id, 1);
    if (res.success) {
      toast.success(`Moved "${item.title.substring(0, 20)}..." to your cart! 🎉`);
      setWishlistItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      toast.error(res.message || 'Failed to add item to cart');
    }
  };

  const handleRemove = (item) => {
    setWishlistItems(prev => prev.filter(i => i.id !== item.id));
    toast.info(`Removed "${item.title.substring(0, 20)}..." from wishlist`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Wishlist</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saved items you love and plan to buy later</p>
          </div>
          <span className="badge badge-primary badge-outline font-bold px-3 py-2 text-xs">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
            <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-sm mx-auto">Explore our wide range of products and save your favorites here for easy checkout later.</p>
            <div>
              <Link to="/" className="btn btn-primary text-white font-bold px-8 rounded-xl shadow-lg shadow-primary/25">
                Explore Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <div key={item.id} className="card bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                <div>
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden mb-4 relative">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="badge badge-primary text-white text-[10px] font-bold absolute top-2 left-2">
                      {item.brand}
                    </span>
                  </div>

                  <Link to={`/product/${item.id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2 text-sm mb-2">
                    {item.title}
                  </Link>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-black text-primary">৳{item.price.toLocaleString()}</span>
                    {item.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">৳{item.oldPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn btn-primary btn-sm flex-1 text-white font-bold rounded-xl gap-1.5"
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    title="Remove from Wishlist"
                    className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-2 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
