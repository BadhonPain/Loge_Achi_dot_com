import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Package, ShoppingCart, Plus, Pencil, Trash2, DollarSign, Clock, Store, AlertCircle } from 'lucide-react';

const API = 'http://localhost:5000/api';

const emptyImageUrls = ['', '', '', '', ''];
const isValidImageUrl = (url) => /^https?:\/\/.+/i.test(url.trim());

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [tab, setTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category_id: '1',
    sku: '',
    product_name: '',
    description: '',
    price: '',
    stock_quantity: '',
    imageUrls: emptyImageUrls
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'SELLER') { navigate('/login?role=seller'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, o, s, c] = await Promise.all([
        axios.get(`${API}/products/vendor/me`),
        axios.get(`${API}/orders/seller/me`),
        axios.get(`${API}/analytics/seller/dashboard`),
        axios.get(`${API}/categories`),
      ]);
      setProducts(p.data.data || []);
      setOrders(o.data.data || []);
      setDashboardStats(s.data.data || null);
      const catList = c.data.data || [];
      setCategories(catList);
      if (catList.length > 0 && !form.category_id) {
        setForm(prev => ({ ...prev, category_id: String(catList[0].category_id) }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load merchant data');
    } finally {
      setLoading(false);
    }
  };

  const generateSku = () => {
    const randomSku = `SKU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    setForm(prev => ({ ...prev, sku: randomSku }));
  };

  // Fills the first empty image slot instead of a single field — keeps the
  // quick-preset convenience from the original design, adapted for 5 slots.
  const applyImagePreset = (url) => {
    setForm(prev => {
      const next = [...prev.imageUrls];
      const emptyIndex = next.findIndex(u => !u.trim());
      if (emptyIndex === -1) return prev; // all 5 slots already filled
      next[emptyIndex] = url;
      return { ...prev, imageUrls: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.product_name.trim()) {
        toast.warn('Please enter a product title');
        return;
      }
      if (!form.price || Number(form.price) < 0) {
        toast.warn('Please enter a valid price');
        return;
      }

      const { imageUrls, ...productFields } = form;

      if (editId) {
        await axios.put(`${API}/products/${editId}`, { ...productFields, status: 'ACTIVE' });
        toast.success('Product updated successfully! 📦');
      } else {
        const validUrls = imageUrls.filter(u => u.trim() && isValidImageUrl(u));
        if (validUrls.length < 4) {
          toast.warn('Please provide at least 4 valid image URLs (http:// or https://)');
          return;
        }
        const payload = {
          ...productFields,
          sku: form.sku.trim() || `SKU-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          images: validUrls.map(u => ({ image_url: u.trim() }))
        };
        await axios.post(`${API}/products`, payload);
        toast.success('Product published to store & marketplace! 🚀');
      }
      setShowForm(false);
      setEditId(null);
      setForm({
        category_id: categories.length > 0 ? String(categories[0].category_id) : '1',
        sku: '',
        product_name: '',
        description: '',
        price: '',
        stock_quantity: '',
        imageUrls: emptyImageUrls
      });
      loadData();
    } catch (err) {
      console.error('Submit Product Error:', err);
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (p) => {
    setForm({
      category_id: String(p.category_id || (categories[0]?.category_id || '1')),
      sku: p.sku || '',
      product_name: p.product_name || p.title || '',
      description: p.description || '',
      price: p.price,
      stock_quantity: p.stock_quantity ?? p.stock ?? '',
      imageUrls: emptyImageUrls // editing existing images isn't supported yet — see note below
    });
    setEditId(p.product_id);
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to archive "${name}"?`)) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.info(`Archived "${name}"`);
      loadData();
    } catch (err) {
      toast.error('Failed to archive product');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/seller/${id}/status`, { status });
      toast.success(`Order #${id} status updated to ${status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (!user || user.role !== 'SELLER') return null;

  const totalRevenue = dashboardStats
    ? Number(dashboardStats.total_revenue || 0)
    : orders.reduce((sum, o) => sum + Number(o.seller_total || 0), 0);
  const pendingOrders = dashboardStats
    ? Number(dashboardStats.pending_orders || 0)
    : orders.filter(o => o.preparation_status === 'PENDING').length;
  const avgRating = dashboardStats ? Number(dashboardStats.avg_rating || 0).toFixed(1) : '5.0';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-warning text-xs font-bold uppercase">Vendor Central</span>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Seller Dashboard</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Logged in as <strong className="text-gray-800 dark:text-gray-200">{user.name}</strong></p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              setForm({
                category_id: categories.length > 0 ? String(categories[0].category_id) : '1',
                sku: `SKU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
                product_name: '',
                description: '',
                price: '',
                stock_quantity: '25',
                imageUrls: emptyImageUrls
              });
            }}
            className="btn btn-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 gap-2"
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>

        {/* DaisyUI Stats Overview */}
        <div className="stats stats-vertical lg:steps-horizontal lg:stats-horizontal shadow-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full mb-8 rounded-3xl">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Package size={28} />
            </div>
            <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Catalog Products</div>
            <div className="stat-value text-primary">{dashboardStats?.total_products ?? products.length}</div>
            <div className="stat-desc text-xs mt-1">{dashboardStats?.active_products ?? products.length} active in store</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-blue-500">
              <ShoppingCart size={28} />
            </div>
            <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Merchant Orders</div>
            <div className="stat-value text-gray-900 dark:text-white">{dashboardStats?.total_orders ?? orders.length}</div>
            <div className="stat-desc text-xs mt-1">Processed orders</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-green-500">
              <DollarSign size={28} />
            </div>
            <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Store Revenue</div>
            <div className="stat-value text-green-600">৳{totalRevenue.toLocaleString()}</div>
            <div className="stat-desc text-xs mt-1">Revenue from your sales</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-amber-500">
              <Clock size={28} />
            </div>
            <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Action</div>
            <div className="stat-value text-amber-500">{pendingOrders}</div>
            <div className="stat-desc text-xs mt-1">★ {avgRating} avg rating ({dashboardStats?.total_reviews || 0} reviews)</div>
          </div>
        </div>

        {/* DaisyUI Tabs */}
        <div className="tabs tabs-boxed w-fit bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setTab('products')}
            className={`tab rounded-xl font-bold text-sm px-6 transition-all ${tab === 'products' ? 'tab-active bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`tab rounded-xl font-bold text-sm px-6 transition-all ${tab === 'orders' ? 'tab-active bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Customer Orders ({orders.length})
          </button>
        </div>

        {/* ADD / EDIT PRODUCT FORM */}
        {showForm && (
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-primary/30 dark:border-primary/40 shadow-xl p-6 md:p-8 mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {editId ? '✏️ Edit Product Details' : '✨ Add New Product to Store & Main Page'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Products are instantly visible on the main page, vendor catalog, and ready for purchase & reviews.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost btn-sm text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Category *</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  required
                  className="select select-bordered w-full rounded-xl font-medium"
                >
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="1">Fashion</option>
                  )}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-gray-500">Product SKU *</label>
                  <button
                    type="button"
                    onClick={generateSku}
                    className="text-[11px] text-primary hover:underline font-bold"
                  >
                    ⚡ Auto-Generate
                  </button>
                </div>
                <input
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. SONY-WH1000-BLK"
                  required
                  className="input input-bordered w-full rounded-xl font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Product Title *</label>
                <input
                  value={form.product_name}
                  onChange={e => setForm({ ...form, product_name: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5 Noise-Canceling Wireless Headphones"
                  required
                  className="input input-bordered w-full rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your item features, warranty, and specifications..."
                  className="textarea textarea-bordered w-full rounded-xl"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Unit Price (BDT ৳) *</label>
                <input
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 35000"
                  type="number"
                  step="0.01"
                  required
                  className="input input-bordered w-full rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Inventory Stock Quantity *</label>
                <input
                  value={form.stock_quantity}
                  onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                  placeholder="e.g. 50"
                  type="number"
                  required
                  className="input input-bordered w-full rounded-xl font-bold"
                />
              </div>

              {/* Product Images (4–5 URLs) with previews and quick presets */}
              {!editId && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Product Images * <span className="normal-case font-normal text-gray-400">(4 required, 5th optional — Image 1 is the primary/cover image shown in the store & marketplace)</span>
                  </label>
                  <div className="flex flex-col gap-2.5">
                    {form.imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center">
                          {url.trim() && isValidImageUrl(url) ? (
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold">#{index + 1}</span>
                          )}
                        </div>
                        <input
                          value={url}
                          onChange={e => {
                            const next = [...form.imageUrls];
                            next[index] = e.target.value;
                            setForm({ ...form, imageUrls: next });
                          }}
                          placeholder={index === 0 ? 'Image 1 URL (Primary) — https://...' : `Image ${index + 1} URL${index === 4 ? ' (optional)' : ''} — https://...`}
                          required={index < 4}
                          className="input input-bordered w-full rounded-xl text-xs"
                        />
                        {index === 0 && (
                          <span className="badge badge-primary text-white text-[10px] font-bold shrink-0">PRIMARY</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Quick Presets — fills the first empty slot */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-gray-400 font-semibold mr-1">Quick Presets:</span>
                    {[
                      { label: '🎧 Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' },
                      { label: '⌚ Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop' },
                      { label: '👟 Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
                      { label: '💻 Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop' },
                      { label: '☕ Mug/Home', url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop' },
                      { label: '💄 Cosmetics', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop' }
                    ].map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyImagePreset(preset.url)}
                        className="badge badge-outline hover:badge-primary text-[10px] cursor-pointer py-2 px-2"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editId && (
                <div className="sm:col-span-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-xl px-3 py-2">
                  <AlertCircle size={14} className="shrink-0" />
                  Editing existing product images isn't supported yet — this update won't change the photos already on file.
                </div>
              )}

              <div className="sm:col-span-2 flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="submit" className="btn btn-primary text-white font-bold px-8 rounded-xl shadow-lg shadow-primary/25">
                  {editId ? 'Save Changes' : 'Publish Product to Store'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px] tracking-wider">
                    <th>Product</th>
                    <th>Category</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                            <img
                              src={p.primary_image || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                              alt={p.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <a
                              href={`/product/${p.product_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors max-w-xs block truncate"
                            >
                              {p.product_name || p.title}
                            </a>
                            <span className="font-mono text-[11px] text-gray-400">ID #{p.product_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-500 font-medium">{p.category_name || 'General'}</td>
                      <td className="font-mono text-xs text-gray-500">{p.sku}</td>
                      <td className="font-bold text-primary">৳{Number(p.price).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${p.stock_quantity > 10 ? 'badge-success text-white' : p.stock_quantity > 0 ? 'badge-warning text-white' : 'badge-error text-white'}`}>
                          {p.stock_quantity ?? p.stock} in stock
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm font-bold ${p.status === 'ACTIVE' ? 'badge-success text-white' : 'badge-neutral'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <a
                            href={`/product/${p.product_id}`}
                            title="View Live on Store"
                            className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 p-1"
                          >
                            <Store size={15} />
                          </a>
                          <button
                            onClick={() => handleEdit(p)}
                            title="Edit"
                            className="btn btn-ghost btn-xs text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 p-1"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.product_id, p.product_name || p.title)}
                            title="Archive"
                            className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package size={44} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 font-medium">No products found in your inventory.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px] tracking-wider">
                    <th>Vendor Order</th>
                    <th>Master Order</th>
                    <th>Customer / Destination</th>
                    <th>Total</th>
                    <th>Preparation Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.seller_order_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="font-mono font-bold text-gray-900 dark:text-white">#{o.seller_order_id}</td>
                      <td className="font-mono text-gray-400">Order #{o.order_id}</td>
                      <td>
                        <p className="font-bold text-gray-900 dark:text-white">{o.shipping_name || 'Customer'}</p>
                        <p className="text-xs text-gray-400">{o.shipping_city || 'Bangladesh'}</p>
                      </td>
                      <td className="font-black text-primary text-base">৳{Number(o.seller_total).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${o.preparation_status === 'READY' || o.preparation_status === 'DELIVERED'
                          ? 'badge-success text-white'
                          : o.preparation_status === 'CANCELLED'
                            ? 'badge-error text-white'
                            : o.preparation_status === 'PREPARING' || o.preparation_status === 'SHIPPED'
                              ? 'badge-info text-white'
                              : 'badge-warning text-white'
                          }`}>
                          {o.preparation_status}
                        </span>
                      </td>
                      <td>
                        <select
                          onChange={e => updateOrderStatus(o.seller_order_id, e.target.value)}
                          defaultValue={o.preparation_status}
                          className="select select-bordered select-xs rounded-lg font-bold"
                        >
                          {['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart size={44} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 font-medium">No orders received yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;