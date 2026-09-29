import { useContext, useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { WishlistContext } from '../../context/WishlistStore';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  const [adding, setAdding] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);

  const productId = product.product_id || product.id;
  const title = product.product_name || product.title || 'Product';
  const price = Number(product.price || 0);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const category = product.category_name || product.category || 'Marketplace';
  const shopName = product.shop_name || product.seller_name;
  const image = product.primary_image || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
  const rating = Number(product.rating ?? 0);
  const reviewsCount = product.reviews !== undefined ? product.reviews : 12;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || (product.stock_quantity !== undefined && product.stock_quantity <= 0);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warn('Please sign in to add items to your cart');
      navigate('/login?role=customer');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      toast.info('Cart is available only to customer accounts.');
      return;
    }
    if (isOutOfStock) {
      toast.error('Sorry, this product is currently out of stock');
      return;
    }

    try {
      setAdding(true);
      const res = await addToCart(productId, 1);
      if (res.success) {
        toast.success(`Added "${title.slice(0, 22)}..." to cart! 🛒`);
      } else {
        toast.error(res.message || 'Failed to add item to cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const wishlisted = isInWishlist(productId);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Sign in with a customer account to save products');
      navigate('/login?role=customer');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      toast.info('Wishlist is available only to customer accounts.');
      return;
    }
    setUpdatingWishlist(true);
    const result = await toggleWishlist(productId);
    setUpdatingWishlist(false);
    if (!result.success) toast.error(result.message);
    else toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {isOutOfStock ? (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Out of Stock
          </span>
        ) : product.discount ? (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            -{product.discount}%
          </span>
        ) : product.isNew ? (
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            New
          </span>
        ) : null}
      </div>

      {/* Hover Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={handleWishlist}
          disabled={updatingWishlist}
          title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${wishlisted ? 'bg-rose-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white'
            }`}
        >
          <Heart size={15} className={wishlisted ? 'fill-white' : ''} />
        </button>
        <Link
          to={`/product/${productId}`}
          title="Quick View"
          className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white shadow-sm transition-colors"
        >
          <Eye size={15} />
        </Link>
      </div>

      {/* Product Image */}
      <Link to={`/product/${productId}`} className="relative w-full aspect-[4/5] bg-gray-50 dark:bg-gray-800/40 overflow-hidden cursor-pointer block">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out p-3 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider truncate">
            {category}
          </span>
          {shopName && (
            <span className="text-[10px] text-primary/80 font-bold bg-primary/5 dark:bg-primary/10 px-1.5 py-0.5 rounded truncate max-w-[110px]">
              {shopName}
            </span>
          )}
        </div>

        <Link to={`/product/${productId}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 leading-snug cursor-pointer hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className={`flex text-yellow-400 ${Number(reviewsCount) > 0 ? '' : 'hidden'}`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className={`w-3 h-3 ${star <= Math.round(rating) ? 'fill-current' : 'text-gray-200 dark:text-gray-700 fill-current'}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-400">{Number(reviewsCount) > 0 ? `${rating.toFixed(1)} (${reviewsCount})` : 'No ratings yet'}</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2 border-t border-gray-50 dark:border-gray-800/60">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-primary">৳{price.toLocaleString()}</span>
            </div>
            {oldPrice && (
              <span className="text-xs text-gray-400 line-through">৳{oldPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={adding || isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className="w-9 h-9 bg-gray-900 dark:bg-gray-800 rounded-xl flex items-center justify-center text-white hover:bg-primary transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group/cart cursor-pointer shadow-sm"
          >
            {adding ? (
              <span className="loading loading-spinner loading-xs text-white"></span>
            ) : (
              <ShoppingCart size={15} className="group-hover/cart:-translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

