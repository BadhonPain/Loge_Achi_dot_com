import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { Package, ShoppingCart, Plus, Pencil, Trash2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category_id: '', sku: '', product_name: '', description: '', price: '', stock_quantity: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'SELLER') { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [p, o] = await Promise.all([
        axios.get(`${API}/products/vendor/me`),
        axios.get(`${API}/orders/seller/me`),
      ]);
      setProducts(p.data.data || []);
      setOrders(o.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editId) {
        await axios.put(`${API}/products/${editId}`, { ...form, status: 'ACTIVE' });
        setSuccess('Product updated');
      } else {
        await axios.post(`${API}/products`, form);
        setSuccess('Product created');
      }
      setShowForm(false); setEditId(null);
      setForm({ category_id: '', sku: '', product_name: '', description: '', price: '', stock_quantity: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (p) => {
    setForm({ category_id: p.category_id, sku: p.sku, product_name: p.product_name, description: p.description || '', price: p.price, stock_quantity: p.stock_quantity });
    setEditId(p.product_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Archive this product?')) return;
    await axios.delete(`${API}/products/${id}`);
    loadData();
  };

  const updateOrderStatus = async (id, status) => {
    await axios.put(`${API}/orders/seller/${id}/status`, { status });
    loadData();
  };

  if (!user || user.role !== 'SELLER') return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Seller Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome, {user.name}</p>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4">{success}</div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-6 w-fit">
          {['products', 'orders'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500'
              }`}>{t}</button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div>
            <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ category_id: '', sku: '', product_name: '', description: '', price: '', stock_quantity: '' }); }}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium mb-6 hover:bg-orange-600 transition-colors">
              <Plus size={18} /> Add Product
            </button>

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6 grid grid-cols-2 gap-4">
                <input value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} placeholder="Category ID" required className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="SKU" required className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                <input value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} placeholder="Product Name" required className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" rows={3} />
                <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price" type="number" step="0.01" required className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                <input value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} placeholder="Stock Quantity" type="number" required className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600">{editId ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">Cancel</button>
                </div>
              </form>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500">
                  <th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">SKU</th><th className="pb-3">Price</th><th className="pb-3">Stock</th><th className="pb-3">Status</th><th className="pb-3">Actions</th>
                </tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.product_id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-3 text-gray-900 dark:text-white">{p.product_id}</td>
                      <td className="py-3 text-gray-900 dark:text-white font-medium">{p.product_name}</td>
                      <td className="py-3 text-gray-500">{p.sku}</td>
                      <td className="py-3 text-gray-900 dark:text-white">৳{Number(p.price).toLocaleString()}</td>
                      <td className="py-3 text-gray-500">{p.stock_quantity}</td>
                      <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                      <td className="py-3 flex gap-2">
                        <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(p.product_id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p className="text-center text-gray-400 py-8">No products yet. Add your first product!</p>}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500">
                <th className="pb-3">Seller Order #</th><th className="pb-3">Order #</th><th className="pb-3">Total</th><th className="pb-3">Prep Status</th><th className="pb-3">Actions</th>
              </tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.seller_order_id} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="py-3 text-gray-900 dark:text-white">#{o.seller_order_id}</td>
                    <td className="py-3 text-gray-500">#{o.order_id}</td>
                    <td className="py-3 text-gray-900 dark:text-white font-bold">৳{Number(o.seller_total).toLocaleString()}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      o.preparation_status === 'READY' ? 'bg-green-100 text-green-700' : o.preparation_status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{o.preparation_status}</span></td>
                    <td className="py-3">
                      <select onChange={e => updateOrderStatus(o.seller_order_id, e.target.value)} defaultValue={o.preparation_status}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 dark:bg-gray-800 dark:text-white">
                        {['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
