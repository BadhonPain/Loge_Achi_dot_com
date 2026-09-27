import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistStore';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { items: wishlistItems, loading, error, fetchWishlist, removeFromWishlist } = useContext(WishlistContext);
  const [busyProductId, setBusyProductId] = useState(null);

  const handleAddToCart = async (item) => {
    if (!user) {
      toast.warn('Please sign in to add items to your cart');
      return;
    }
    setBusyProductId(item.product_id);
    const res = await addToCart(item.product_id, 1);
    if (res.success) {
      const removed = await removeFromWishlist(item.product_id);
      if (removed.success) toast.success(`Moved "${item.product_name.substring(0, 20)}..." to your cart!`);
      else toast.error(`Added to cart, but ${removed.message.toLowerCase()}`);
    } else {
      toast.error(res.message || 'Failed to add item to cart');
    }
    setBusyProductId(null);
  };

  const handleRemove = async (item) => {
    setBusyProductId(item.product_id);
    const result = await removeFromWishlist(item.product_id);
    setBusyProductId(null);
    if (result.success) toast.info('Removed from wishlist');
    else toast.error(result.message);
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

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading your wishlist...</div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button type="button" onClick={fetchWishlist} className="btn btn-outline btn-sm">Retry</button>
          </div>
        ) : wishlistItems.length === 0 ? (
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
              <div key={item.product_id} className="card bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                <div>
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden mb-4 relative">
                    <img
                      src={item.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                      alt={item.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="badge badge-primary text-white text-[10px] font-bold absolute top-2 left-2">
                      {item.shop_name || item.category_name || 'Marketplace'}
                    </span>
                  </div>

                  <Link to={`/product/${item.product_id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2 text-sm mb-2">
                    {item.product_name}
                  </Link>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-black text-primary">৳{Number(item.price).toLocaleString()}</span>
                    {item.status !== 'ACTIVE' && <span className="text-xs text-red-500">Currently unavailable</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={busyProductId === item.product_id || item.status !== 'ACTIVE'}
                    className="btn btn-primary btn-sm flex-1 text-white font-bold rounded-xl gap-1.5"
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={busyProductId === item.product_id}
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
