import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/common/ProductCard';
import allMockProducts from '../data/products';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// Map slugs to display names
const categoryMeta = {
  'smartphones': { name: 'Smartphones', desc: 'Latest flagship and budget smartphones' },
  'sneakers': { name: "Men's Sneakers", desc: 'Sport, casual and lifestyle footwear' },
  'beauty': { name: 'Beauty & Skincare', desc: 'Skincare, makeup and wellness products' },
  'laptops': { name: 'Laptops', desc: 'Ultrabooks, gaming laptops and more' },
  'watches': { name: 'Watches', desc: 'Smart, luxury and casual timepieces' },
  'home-decor': { name: 'Home Decor', desc: 'Transform your living space' },
  'womens-fashion': { name: "Women's Fashion", desc: 'Trending styles for every occasion' },
  'gaming': { name: 'Gaming Consoles', desc: 'Consoles, controllers and accessories' },
  'all': { name: 'All Categories', desc: 'Browse everything on LogeAchi' },
};

const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Top Rated'];

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q')?.trim() || '';
  const categoryId = searchParams.get('categoryId');

  const [rawProducts, setRawProducts] = useState([]);
  const [sortBy, setSortBy] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    axios.get(`${API}/products`)
      .then((res) => {
        if (!active) return;
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setRawProducts(res.data.data);
        } else {
          setRawProducts(allMockProducts);
        }
      })
      .catch(() => {
        if (active) setRawProducts(allMockProducts);
      });
    return () => { active = false; };
  }, [slug]);

  let products = [...rawProducts];
  if (categoryId) {
    products = products.filter((product) => String(product.category_id) === categoryId);
  }
  if (searchQuery) {
    const normalizedQuery = searchQuery.toLowerCase();
    products = products.filter((product) => [
      product.product_name,
      product.title,
      product.description,
      product.category_name,
      product.shop_name,
      product.seller_name,
    ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery)));
  } else if (!categoryId && slug && slug !== 'all') {
    const slugLower = slug.toLowerCase().replace('-', ' ');
    const filtered = products.filter(p => {
      const catName = (p.category_name || p.category || '').toLowerCase();
      const title = (p.product_name || p.title || '').toLowerCase();
      return catName.includes(slugLower) || title.includes(slugLower);
    });
    if (filtered.length > 0) products = filtered;
  }

  const selectedCategory = categoryId
    ? rawProducts.find((product) => String(product.category_id) === categoryId)?.category_name
    : null;
  const meta = searchQuery
    ? { name: 'Search results', desc: `Matches for “${searchQuery}”` }
    : selectedCategory
      ? { name: selectedCategory, desc: 'Browse products in this department' }
      : categoryMeta[slug] || { name: slug ? slug.replace('-', ' ') : 'All Products', desc: 'Browse products in this category' };

  if (sortBy === 'Price: Low to High') products.sort((a, b) => Number(a.price) - Number(b.price));
  if (sortBy === 'Price: High to Low') products.sort((a, b) => Number(b.price) - Number(a.price));
  if (sortBy === 'Top Rated') products.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] dark:bg-gray-950 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb + Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight size={14} />
              <Link to="/categories" className="hover:text-primary">Categories</Link>
              <ChevronRight size={14} />
              <span className="text-gray-900 dark:text-white font-medium">{meta.name}</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{meta.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{products.length} products found · {meta.desc}</p>
              </div>
              {/* Sort + Filter Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <SlidersHorizontal size={16} /> Filters
                </button>
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-sm text-gray-700 dark:text-gray-300 dark:bg-gray-900 outline-none cursor-pointer"
                  >
                    {sortOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Drawer (simple inline) */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range</p>
                <div className="flex gap-2">
                  {['Under ৳1000', '৳1000–৳5000', '৳5000–৳20000', 'Above ৳20000'].map(r => (
                    <button key={r} className="text-xs border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full transition-colors">{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rating</p>
                <div className="flex gap-2">
                  {['4★ & up', '3★ & up', 'All'].map(r => (
                    <button key={r} className="text-xs border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full transition-colors">{r}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {products.length > 0 ? products.map(product => (
              <ProductCard key={product.id || product.product_id} product={product} />
            )) : (
              <div className="col-span-full py-20 text-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try a different search or browse all departments.</p>
                <Link to="/categories" className="btn btn-primary mt-5 text-white">Browse all products</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
