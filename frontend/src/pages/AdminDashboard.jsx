import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { Users, Store, Package, ShoppingCart, DollarSign, Shield } from 'lucide-react';

const API = 'http://localhost:5000/api/admin';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [s, c, sl, o] = await Promise.all([
        axios.get(`${API}/dashboard`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/sellers`),
        axios.get(`${API}/orders`),
      ]);
      setStats(s.data.data);
      setCustomers(c.data.data);
      setSellers(sl.data.data);
      setOrders(o.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    }
  };

  const updateSellerStatus = async (id, status) => {
    await axios.put(`${API}/sellers/${id}/status`, { status });
    loadData();
  };

  const updateCustomerStatus = async (id, account_status) => {
    await axios.put(`${API}/customers/${id}/status`, { account_status });
    loadData();
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="text-primary" size={28} />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-blue-500' },
              { label: 'Sellers', value: stats.totalSellers, icon: Store, color: 'text-green-500' },
              { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-500' },
              { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-orange-500' },
              { label: 'Revenue', value: `৳${Number(stats.totalRevenue).toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <s.icon size={24} className={s.color + ' mb-2'} />
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-6 w-fit">
          {['overview', 'customers', 'sellers', 'orders'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}>{t}</button>
          ))}
        </div>

        {/* Customers Table */}
        {(tab === 'overview' || tab === 'customers') && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Customers ({customers.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500">
                  <th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Phone</th><th className="pb-3">Status</th><th className="pb-3">Actions</th>
                </tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.customer_id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-3 text-gray-900 dark:text-white">{c.customer_id}</td>
                      <td className="py-3 text-gray-900 dark:text-white font-medium">{c.name}</td>
                      <td className="py-3 text-gray-500">{c.email}</td>
                      <td className="py-3 text-gray-500">{c.phone || '—'}</td>
                      <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.account_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.account_status}</span></td>
                      <td className="py-3">
                        {c.account_status === 'ACTIVE'
                          ? <button onClick={() => updateCustomerStatus(c.customer_id, 'SUSPENDED')} className="text-xs text-red-500 hover:text-red-700 font-medium">Suspend</button>
                          : <button onClick={() => updateCustomerStatus(c.customer_id, 'ACTIVE')} className="text-xs text-green-500 hover:text-green-700 font-medium">Activate</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sellers Table */}
        {(tab === 'overview' || tab === 'sellers') && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sellers ({sellers.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500">
                  <th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">Shop</th><th className="pb-3">Email</th><th className="pb-3">Status</th><th className="pb-3">Actions</th>
                </tr></thead>
                <tbody>
                  {sellers.map(s => (
                    <tr key={s.seller_id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-3 text-gray-900 dark:text-white">{s.seller_id}</td>
                      <td className="py-3 text-gray-900 dark:text-white font-medium">{s.seller_name}</td>
                      <td className="py-3 text-gray-500">{s.shop_name}</td>
                      <td className="py-3 text-gray-500">{s.email}</td>
                      <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : s.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>{s.status}</span></td>
                      <td className="py-3 flex gap-2">
                        {s.status !== 'ACTIVE' && <button onClick={() => updateSellerStatus(s.seller_id, 'ACTIVE')} className="text-xs text-green-500 hover:text-green-700 font-medium">Approve</button>}
                        {s.status !== 'SUSPENDED' && <button onClick={() => updateSellerStatus(s.seller_id, 'SUSPENDED')} className="text-xs text-red-500 hover:text-red-700 font-medium">Suspend</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {(tab === 'overview' || tab === 'orders') && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Orders ({orders.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500">
                  <th className="pb-3">Order #</th><th className="pb-3">Customer</th><th className="pb-3">Total</th><th className="pb-3">Status</th><th className="pb-3">Date</th>
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.order_id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-3 text-gray-900 dark:text-white font-medium">#{o.order_id}</td>
                      <td className="py-3 text-gray-500">{o.customer_name}</td>
                      <td className="py-3 text-gray-900 dark:text-white font-bold">৳{Number(o.total_amount).toLocaleString()}</td>
                      <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        o.order_status === 'DELIVERED' ? 'bg-green-100 text-green-700' : o.order_status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>{o.order_status}</span></td>
                      <td className="py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
