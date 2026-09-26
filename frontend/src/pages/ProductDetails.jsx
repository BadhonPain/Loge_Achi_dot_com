import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, Minus, Plus, ChevronRight, Store, Package, MessageCircle, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getProductById as getMockProductById } from '../data/products';

const API = 'http://localhost:5000/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [showVendorModal, setShowVendorModal] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // Fetch product from backend
      const res = await axios.get(`${API}/products/${id}`);
      if (res.data?.success && res.data?.data) {
        const p = res.data.data;
        const normalized = {
          id: p.product_id || p.id,
          product_id: p.product_id || p.id,
          title: p.product_name || p.title || 'Product',
          product_name: p.product_name || p.title || 'Product',
          category: p.category_name || p.category || 'General',
          brand: p.shop_name || p.seller_name || 'LogeAchi Verified',
          sku: p.sku || `SKU-${p.product_id}`,
          price: Number(p.price || 0),
          oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
          discount: p.discount || null,
          stock: p.stock_quantity !== undefined ? p.stock_quantity : (p.stock || 20),
          rating: Number(p.rating || 5.0),
          reviews: p.reviews || 0,
          sold: p.sold || 35,
          description: p.description || 'Premium quality product verified by LogeAchi quality standards. Guaranteed authentic.',
          images: Array.isArray(p.images) && p.images.length > 0 
            ? p.images 
            : [p.primary_image || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'],
          features: Array.isArray(p.features) && p.features.length > 0
            ? p.features
            : [
                '100% Genuine and authentic from official vendor',
                'Comprehensive manufacturer warranty included',
                'Fast doorstep delivery across Bangladesh',
                '7-day hassle-free replacement guarantee'
              ],
          colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : ['Standard Edition'],
          seller: p.seller || {
            id: p.seller_id,
            name: p.shop_name || p.seller_name || 'Official Store',
            rating: '4.9',
            products: 15
          }
        };
        setProduct(normalized);
      }
    } catch (err) {
      console.warn('Backend fetch failed, falling back to mock product:', err.message);
      const mock = getMockProductById(id);
      if (mock) {
        setProduct(mock);
      } else {
        setProduct(null);
      }
    } finally {
      setLoading(false);
      loadReviews();
    }
  };

  const loadReviews = async () => {
    try {
      const res = await axios.get(`${API}/reviews/product/${id}`);
      if (res.data?.success) {
        setReviewsList(res.data.data || []);
      }
    } catch (e) {
      // Fallback reviews
    }
  };

  const handleOpenVendorStore = async () => {
    if (!product?.seller?.id) {
      toast.info(`Viewing ${product?.seller?.name || 'vendor'} catalog`);
      return;
    }
    try {
      const res = await axios.get(`${API}/products?seller_id=${product.seller.id}`);
      setVendorProducts(res.data.data || []);
      setShowVendorModal(true);
    } catch (e) {
      toast.info(`Viewing ${product.seller.name} store`);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.warn('Please sign in as a customer to add items to cart');
      navigate('/login?role=customer');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      toast.info('Sign in with a customer account to purchase items');
      return;
    }
    setAddingToCart(true);

    const targetProductId = Number(product.product_id || product.id || id);
    const result = await addToCart(targetProductId, quantity);

    setAddingToCart(false);
    if (result.success) {
      toast.success(`Added ${quantity} item(s) to your cart! 🎉`, {
        icon: '🛒',
      });
    } else {
      toast.error(result.message || 'Failed to add item to cart');
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`Saved "${product.title.substring(0, 20)}..." to wishlist! ❤️`);
    } else {
      toast.info('Removed from wishlist');
    }
  };

  // Reset selections when navigating to a different product
  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(0);
    setQuantity(1);
    setActiveTab('description');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfcfc] dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm font-medium text-gray-400">Loading product details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfcfc] dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">We couldn't find what you were looking for.</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
            Back to Home
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleQuantity = (action) => {
    if (action === 'inc' && quantity < product.stock) setQuantity(q => q + 1);
    if (action === 'dec' && quantity > 1) setQuantity(q => q - 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] dark:bg-gray-950 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumbs with DaisyUI */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="breadcrumbs text-sm text-gray-500 dark:text-gray-400">
            <ul>
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><span className="hover:text-primary cursor-pointer">{product.category}</span></li>
              <li className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">{product.title}</li>
            </ul>
          </div>
        </div>

        {/* Main Product Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-5">
              <div className="sticky top-28">
                {/* Main Image */}
                <div className="aspect-square bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-4 group shadow-sm">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER: Product Info */}
            <div className="lg:col-span-4">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider">{product.brand}</span>
                    {product.stock > 0 ? (
                      <span className="badge badge-success text-white text-xs font-semibold">In Stock ({product.stock})</span>
                    ) : (
                      <span className="badge badge-error text-white text-xs font-semibold">Out of Stock</span>
                    )}
                    <span className="badge badge-ghost text-xs font-medium">SKU: {product.sku}</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{product.title}</h1>
                </div>

                {/* Rating with DaisyUI rating */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name="rating-product"
                        className="mask mask-star-2 bg-amber-400"
                        checked={Math.round(product.rating) === star}
                        readOnly
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{product.rating}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{product.reviews} reviews</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{product.sold}+ sold</span>
                </div>

                {/* Price */}
                <div className="card bg-orange-50/80 dark:bg-orange-950/30 rounded-2xl p-5 border border-orange-100/60 dark:border-orange-900/30">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl lg:text-4xl font-black text-primary">৳{product.price.toLocaleString()}</span>
                    {product.oldPrice && (
                      <span className="text-lg text-gray-400 line-through">৳{product.oldPrice.toLocaleString()}</span>
                    )}
                    {product.discount && (
                      <span className="badge badge-primary text-white font-bold text-xs py-2.5">-{product.discount}% OFF</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Prices are inclusive of all taxes</p>
                </div>

                {/* Color Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Color: <span className="font-bold text-gray-900 dark:text-white">{product.colors[selectedColor]}</span></p>
                  <div className="flex gap-3">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(idx)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          selectedColor === idx 
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quantity</p>
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xs">
                      <button 
                        type="button"
                        onClick={() => handleQuantity('dec')} 
                        className="inline-flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="inline-flex items-center justify-center w-12 h-10 text-sm font-bold text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700 select-none">
                        {quantity}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleQuantity('inc')} 
                        className="inline-flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{product.stock} units available</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl font-bold text-white bg-primary hover:bg-orange-600 active:scale-[0.98] shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {addingToCart ? (
                      <>
                        <span className="loading loading-spinner loading-sm text-white"></span>
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={19} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`inline-flex items-center justify-center h-12 w-12 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      isWishlisted 
                        ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/50'
                    }`}
                    title={isWishlisted ? "In your Wishlist" : "Add to Wishlist"}
                  >
                    <Heart size={20} className={isWishlisted ? "fill-white" : ""} />
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-center">
                    <Truck size={20} className="mx-auto text-gray-600 dark:text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <ShieldCheck size={20} className="mx-auto text-gray-600 dark:text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Genuine Product</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw size={20} className="mx-auto text-gray-600 dark:text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">7 Day Return</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Seller Info Card */}
            <div className="lg:col-span-3">
              <div className="sticky top-28 space-y-4">
                <div className="card bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                      <Store size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {product.seller.name}
                        <span className="badge badge-xs badge-success text-white">Verified</span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="font-bold">{product.seller.rating}</span>
                        <span className="mx-1">·</span>
                        <span>{product.seller.products} products</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider">Ship on Time</p>
                      <p className="font-extrabold text-gray-900 dark:text-white text-sm mt-0.5">98.5%</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider">Response</p>
                      <p className="font-extrabold text-gray-900 dark:text-white text-sm mt-0.5">&lt; 1 hour</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={handleOpenVendorStore} 
                      className="btn btn-outline btn-primary btn-sm w-full rounded-xl gap-2 font-bold"
                    >
                      <Store size={15} /> Visit Store ({product.seller.name})
                    </button>
                    <button 
                      onClick={() => toast.info(`Connecting to ${product.seller.name} customer service...`)} 
                      className="btn btn-ghost btn-sm w-full rounded-xl gap-2 text-gray-600 dark:text-gray-300 font-medium"
                    >
                      <MessageCircle size={15} /> Chat with Vendor
                    </button>
                  </div>
                </div>

                {/* Delivery Info Card */}
                <div className="card bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center justify-between">
                    <span>Delivery & Services</span>
                    <span className="badge badge-ghost badge-sm text-[10px]">Nationwide</span>
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 shrink-0">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Standard Delivery</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2-4 business days · ৳60</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-primary shrink-0">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Free Express Shipping</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Eligible on orders over ৳5000</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 shrink-0">
                        <RotateCcw size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">7 Days Return</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Change of mind applicable</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs: Description / Reviews with DaisyUI */}
        <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="tabs tabs-bordered mb-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`tab tab-lg font-bold pb-3 ${activeTab === 'description' ? 'tab-active text-primary border-primary' : 'text-gray-400'}`}
              >
                Product Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`tab tab-lg font-bold pb-3 ${activeTab === 'reviews' ? 'tab-active text-primary border-primary' : 'text-gray-400'}`}
              >
                Customer Reviews ({reviewsList.length > 0 ? reviewsList.length : product.reviews})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'description' ? (
              <div className="max-w-3xl">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">{product.description?.trim()}</p>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="max-w-3xl space-y-6">
                {reviewsList.length > 0 ? (
                  reviewsList.map((review) => (
                    <div key={review.review_id || review.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {(review.customer_name || review.user || 'Verified Buyer').charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{review.customer_name || review.user || 'Verified Customer'}</span>
                        <span className="text-xs text-gray-400">{review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString() : review.date || 'Recent'}</span>
                        <span className="badge badge-success badge-xs text-white">Verified Purchase</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 font-medium text-sm">No reviews yet for this product.</p>
                    <p className="text-xs text-gray-400 mt-1">Purchased this item? Leave your review after order delivery!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Vendor Showcase Modal */}
        {showVendorModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    <Store size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                      {product.seller.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Official Vendor Shop Catalog · {vendorProducts.length} Products
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVendorModal(false)}
                  className="btn btn-circle btn-sm btn-ghost"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vendorProducts.map((vp) => (
                    <div 
                      key={vp.product_id}
                      onClick={() => {
                        setShowVendorModal(false);
                        navigate(`/product/${vp.product_id}`);
                      }}
                      className="card bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white dark:bg-gray-900">
                        <img 
                          src={vp.primary_image || vp.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'} 
                          alt={vp.product_name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate group-hover:text-primary">
                        {vp.product_name}
                      </h4>
                      <p className="text-xs font-black text-primary mt-1">
                        ৳{Number(vp.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {vendorProducts.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      No other products in this vendor's catalog yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
