import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, Minus, Plus, ChevronRight, Store, Package, MessageCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getProductById } from '../data/products';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Reset selections when navigating to a different product
  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(0);
    setQuantity(1);
    setActiveTab('description');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-gray-500">We couldn't find what you were looking for.</p>
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
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} />
            <span className="hover:text-primary cursor-pointer">{product.category}</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.title.substring(0, 40)}...</span>
          </nav>
        </div>

        {/* Main Product Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-5">
              <div className="sticky top-28">
                {/* Main Image */}
                <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 mb-4 group">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-300'
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
                  <p className="text-sm text-primary font-medium mb-2">{product.brand}</p>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                    <span className="text-sm font-bold text-gray-900 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{product.reviews} Reviews</span>
                  <span className="text-sm text-gray-500">{product.sold}+ Sold</span>
                </div>

                {/* Price */}
                <div className="bg-orange-50/80 rounded-xl p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-primary">৳{product.price}</span>
                    {product.oldPrice && (
                      <span className="text-lg text-gray-400 line-through">৳{product.oldPrice}</span>
                    )}
                    {product.discount && (
                      <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">-{product.discount}%</span>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Color: <span className="font-bold text-gray-900">{product.colors[selectedColor]}</span></p>
                  <div className="flex gap-3">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(idx)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedColor === idx 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Quantity</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => handleQuantity('dec')} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600">
                        <Minus size={16} />
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center text-sm font-bold border-x border-gray-200">{quantity}</span>
                      <button onClick={() => handleQuantity('inc')} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600">
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">{product.stock} pieces available</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                  <button className="w-12 h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <Truck size={20} className="mx-auto text-gray-600 mb-1" />
                    <p className="text-xs text-gray-500">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <ShieldCheck size={20} className="mx-auto text-gray-600 mb-1" />
                    <p className="text-xs text-gray-500">Genuine Product</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw size={20} className="mx-auto text-gray-600 mb-1" />
                    <p className="text-xs text-gray-500">7 Day Return</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Seller Info Card */}
            <div className="lg:col-span-3">
              <div className="sticky top-28 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Store size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.seller.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{product.seller.rating}</span>
                        <span className="mx-1">·</span>
                        <span>{product.seller.products} Products</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Ship on Time</p>
                      <p className="font-bold text-gray-900 text-sm">98%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Response</p>
                      <p className="font-bold text-gray-900 text-sm">Within 1h</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full border border-primary text-primary hover:bg-primary hover:text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                      <Store size={16} /> Visit Store
                    </button>
                    <button className="w-full border border-gray-200 text-gray-600 hover:border-gray-400 font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                      <MessageCircle size={16} /> Chat with Seller
                    </button>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">Delivery</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Package size={18} className="text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Standard Delivery</p>
                        <p className="text-xs text-gray-500">3-5 business days · ৳60</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck size={18} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                        <p className="text-xs text-gray-500">On orders above ৳5000</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw size={18} className="text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Easy Return</p>
                        <p className="text-xs text-gray-500">7 days return policy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs: Description / Reviews */}
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            {/* Tab Headers */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
              {['description', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                    activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'description' ? 'Description' : `Reviews (${product.reviews})`}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'description' ? (
              <div className="max-w-3xl">
                <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.description.trim()}</p>
                <h3 className="font-bold text-gray-900 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-600">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="max-w-3xl space-y-6">
                {product.reviewsList.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {review.user.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{review.user}</span>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
