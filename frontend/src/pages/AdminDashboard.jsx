import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Users, Store, Package, ShoppingCart, DollarSign, Shield, CheckCircle,
  Ban, AlertCircle, BarChart3, TrendingUp, Award, Layers, History, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ADMIN = `${API_BASE}/admin`;
const API_ANALYTICS = `${API_BASE}/analytics`;

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [applicationRefresh, setApplicationRefresh] = useState(0);
  const [rejectionApplication, setRejectionApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingApplicationId, setReviewingApplicationId] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Analytics states (Complex Queries 1-5 & DB Functions)
  const [topProducts, setTopProducts] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [categoryAnalytics, setCategoryAnalytics] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Audit Log State (Trigger shadow table: order_status_log)
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedOrderForAudit, setSelectedOrderForAudit] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/login?role=admin'); return; }
    loadData();
  }, [user]);

  useEffect(() => {
    if (tab === 'analytics') {
      loadAnalytics();
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== 'applications') return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return undefined;
      setApplicationsLoading(true);
      setApplicationsError('');
      return axios.get(`${API_ADMIN}/vendor-applications`);
    }).then((response) => {
      if (active && response) setApplications(response.data.data || []);
    }).catch((error) => {
      if (active) setApplicationsError(error.response?.data?.message || 'Failed to load vendor applications');
    }).finally(() => {
      if (active) setApplicationsLoading(false);
    });
    return () => { active = false; };
  }, [tab, applicationRefresh]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, c, sl, o] = await Promise.all([
        axios.get(`${API_ADMIN}/dashboard`),
        axios.get(`${API_ADMIN}/customers`),
        axios.get(`${API_ADMIN}/sellers`),
        axios.get(`${API_ADMIN}/orders`),
      ]);
      setStats(s.data.data);
      setCustomers(c.data.data);
      setSellers(sl.data.data);
      setOrders(o.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [tp, ts, ca, cu, rt] = await Promise.all([
        axios.get(`${API_ANALYTICS}/top-products`),
        axios.get(`${API_ANALYTICS}/top-sellers`),
        axios.get(`${API_ANALYTICS}/categories`),
        axios.get(`${API_ANALYTICS}/customers`),
        axios.get(`${API_ANALYTICS}/revenue-trend`),
      ]);
      setTopProducts(tp.data.data || []);
      setTopSellers(ts.data.data || []);
      setCategoryAnalytics(ca.data.data || []);
      setCustomerAnalytics(cu.data.data || []);
      setRevenueTrend(rt.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const updateSellerStatus = async (id, status) => {
    try {
      await axios.put(`${API_ADMIN}/sellers/${id}/status`, { status });
      toast.success(`Seller #${id} status updated to ${status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update seller status');
    }
  };

  const reviewVendorApplication = async (application, status, reason = '') => {
    setReviewingApplicationId(application.application_id);
    try {
      await axios.put(`${API_ADMIN}/vendor-applications/${application.application_id}/review`, {
        status,
        rejection_reason: reason,
      });
      toast.success(status === 'APPROVED' ? 'Application approved and seller account activated' : `Application moved to ${status.toLowerCase().replace('_', ' ')}`);
      setRejectionApplication(null);
      setRejectionReason('');
      setApplicationRefresh((value) => value + 1);
      if (status === 'APPROVED') loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update application');
    } finally {
      setReviewingApplicationId(null);
    }
  };

  const updateCustomerStatus = async (id, account_status) => {
    try {
      await axios.put(`${API_ADMIN}/customers/${id}/status`, { account_status });
      toast.success(`Customer #${id} status updated to ${account_status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update customer status');
    }
  };

  // View audit log written by database trigger
  const viewOrderAuditLog = async (orderId) => {
    setSelectedOrderForAudit(orderId);
    setAuditModalOpen(true);
    try {
      const res = await axios.get(`${API_ANALYTICS}/orders/${orderId}/log`);
      setAuditLogs(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch order status audit log');
      setAuditLogs([]);
    }
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shadow-sm">
              <Shield size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Admin Console</h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Platform governance, financial analytics, and order audit history</p>
            </div>
          </div>
        </div>

        {/* DaisyUI Stats KPIs */}
        {stats && (
          <div className="stats stats-vertical lg:stats-horizontal shadow-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full mb-8 rounded-3xl">
            <div className="stat">
              <div className="stat-figure text-blue-500">
                <Users size={28} />
              </div>
              <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Customers</div>
              <div className="stat-value text-blue-600">{stats.totalCustomers}</div>
              <div className="stat-desc text-xs mt-1">Registered shoppers</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-green-500">
                <Store size={28} />
              </div>
              <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Vendors</div>
              <div className="stat-value text-green-600">{stats.totalSellers}</div>
              <div className="stat-desc text-xs mt-1">Merchant accounts</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-purple-500">
                <Package size={28} />
              </div>
              <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Products</div>
              <div className="stat-value text-purple-600">{stats.totalProducts}</div>
              <div className="stat-desc text-xs mt-1">Active inventory</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-orange-500">
                <ShoppingCart size={28} />
              </div>
              <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Orders</div>
              <div className="stat-value text-orange-500">{stats.totalOrders}</div>
              <div className="stat-desc text-xs mt-1">Total system orders</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-primary">
                <DollarSign size={28} />
              </div>
              <div className="stat-title text-xs font-bold text-gray-400 uppercase tracking-wider">Total GMV</div>
              <div className="stat-value text-primary">৳{Number(stats.totalRevenue).toLocaleString()}</div>
              <div className="stat-desc text-xs mt-1">Platform gross volume</div>
            </div>
          </div>
        )}

        {/* DaisyUI Tabs */}
        <div className="tabs tabs-boxed w-fit bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl mb-6 flex-wrap">
          {['overview', 'analytics', 'customers', 'sellers', 'applications', 'orders'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab rounded-xl font-bold text-sm px-6 capitalize transition-all ${tab === t ? 'tab-active bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {t === 'overview' ? 'Overview' :
                t === 'analytics' ? '📊 Analytics' :
                  `${t} (${t === 'customers' ? customers.length : t === 'sellers' ? sellers.length : t === 'applications' ? applications.filter((application) => !['APPROVED', 'REJECTED'].includes(application.status)).length : orders.length})`}
            </button>
          ))}
        </div>

        {tab === 'applications' && (
          <section className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Vendor Applications</h2>
                <p className="text-xs text-gray-500 mt-1">Review applications before creating seller accounts.</p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setApplicationRefresh((value) => value + 1)}>Refresh</button>
            </div>
            {applicationsLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">Loading applications…</div>
            ) : applicationsError ? (
              <div role="alert" className="alert alert-error">{applicationsError}</div>
            ) : applications.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">No vendor applications have been submitted.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead><tr className="text-xs uppercase text-gray-500"><th>Applicant</th><th>Store</th><th>Business</th><th>Location</th><th>Status</th><th>Decision</th></tr></thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.application_id}>
                        <td><strong>{application.full_name}</strong><p className="text-xs text-gray-500">{application.email}<br />{application.phone}</p></td>
                        <td><strong>{application.store_name}</strong><p className="text-xs text-gray-500">{application.category_name}</p></td>
                        <td className="min-w-64"><details><summary className="cursor-pointer text-primary font-semibold">View description</summary><p className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300 mt-2">{application.business_description}</p></details></td>
                        <td className="text-xs">{[application.address, application.city, application.postal_code, application.country].filter(Boolean).join(', ')}</td>
                        <td><span className={`badge badge-sm ${application.status === 'APPROVED' ? 'badge-success' : application.status === 'REJECTED' ? 'badge-error' : 'badge-warning'}`}>{application.status.replace('_', ' ')}</span>
                          {application.rejection_reason && <p className="text-xs text-red-500 mt-1 max-w-40">{application.rejection_reason}</p>}
                        </td>
                        <td><div className="flex flex-wrap gap-1.5 min-w-40">
                          {['PENDING', 'UNDER_REVIEW'].includes(application.status) ? <>
                            {application.status === 'PENDING' && <button type="button" disabled={reviewingApplicationId === application.application_id} onClick={() => reviewVendorApplication(application, 'UNDER_REVIEW')} className="btn btn-outline btn-xs">Review</button>}
                            <button type="button" disabled={reviewingApplicationId === application.application_id} onClick={() => reviewVendorApplication(application, 'APPROVED')} className="btn btn-success btn-xs text-white">Approve</button>
                            <button type="button" disabled={reviewingApplicationId === application.application_id} onClick={() => { setRejectionApplication(application); setRejectionReason(''); }} className="btn btn-error btn-xs text-white">Reject</button>
                          </> : <span className="text-xs text-gray-400">Decision recorded</span>}
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {rejectionApplication && (
          <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="reject-application-title">
            <div className="modal-box">
              <h2 id="reject-application-title" className="text-lg font-bold">Reject application</h2>
              <p className="text-sm text-gray-500 mt-1">The applicant can see this reason on their status page.</p>
              <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={4} maxLength={2000} className="textarea textarea-bordered w-full mt-4" placeholder="Explain what needs to be addressed" />
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setRejectionApplication(null)}>Cancel</button>
                <button type="button" className="btn btn-error text-white" disabled={!rejectionReason.trim() || reviewingApplicationId === rejectionApplication.application_id} onClick={() => reviewVendorApplication(rejectionApplication, 'REJECTED', rejectionReason)}>Confirm rejection</button>
              </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Close rejection dialog" onClick={() => setRejectionApplication(null)}>close</button>
          </div>
        )}

        {/* ============================================= */}
        {/* ANALYTICS TAB */}
        {/* ============================================= */}
        {tab === 'analytics' && (
          <div className="space-y-8 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md">
              <h2 className="text-xl font-black mb-1 flex items-center gap-2">
                <BarChart3 size={24} /> Analytics
              </h2>
            </div>

            {/* Top Selling Products */}
            <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Award size={20} className="text-amber-500" /> Top Selling Products
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px]">
                      <th>Product</th>
                      <th>Shop</th>
                      <th>Category</th>
                      <th>Unit Price</th>
                      <th>Total Units Sold</th>
                      <th>Total Revenue</th>
                      <th>Average Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map(p => (
                      <tr key={p.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="font-bold text-gray-900 dark:text-white">{p.product_name}</td>
                        <td className="text-gray-500 text-xs">{p.shop_name}</td>
                        <td><span className="badge badge-ghost text-xs font-semibold">{p.category_name}</span></td>
                        <td className="font-bold">৳{Number(p.price).toLocaleString()}</td>
                        <td className="font-bold text-blue-600">{p.total_sold} units</td>
                        <td className="font-black text-primary">৳{Number(p.total_revenue).toLocaleString()}</td>
                        <td>
                          <span className="badge badge-sm badge-success text-white font-bold">
                            ★ {Number(p.avg_rating).toFixed(1)} ({p.review_count})
                          </span>
                        </td>
                      </tr>
                    ))}
                    {topProducts.length === 0 && (
                      <tr><td colSpan="7" className="text-center py-6 text-gray-400">No product sales records yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Sellers by Revenue */}
            <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500" /> Top Merchants by Revenue
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px]">
                      <th>Merchant</th>
                      <th>Store Name</th>
                      <th>Products</th>
                      <th>Orders Processed</th>
                      <th>Calculated Revenue</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellers.map(s => (
                      <tr key={s.seller_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="font-bold text-gray-900 dark:text-white">{s.seller_name}</td>
                        <td className="font-semibold text-gray-700 dark:text-gray-300">{s.shop_name}</td>
                        <td className="font-mono text-xs">{s.product_count}</td>
                        <td className="font-mono text-xs">{s.order_count}</td>
                        <td className="font-black text-green-600">৳{Number(s.total_revenue).toLocaleString()}</td>
                        <td>
                          <span className="badge badge-sm badge-ghost font-bold">★ {Number(s.avg_rating).toFixed(1)}</span>
                        </td>
                      </tr>
                    ))}
                    {topSellers.length === 0 && (
                      <tr><td colSpan="6" className="text-center py-6 text-gray-400">No seller revenue records yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Sales Analytics */}
            <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers size={20} className="text-purple-500" /> Category Sales Performance
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px]">
                      <th>Category</th>
                      <th>Catalog Size</th>
                      <th>Orders</th>
                      <th>Units Sold</th>
                      <th>Category GMV</th>
                      <th>Best Selling Product</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryAnalytics.map(c => (
                      <tr key={c.category_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="font-bold text-gray-900 dark:text-white">{c.category_name}</td>
                        <td className="font-mono text-xs">{c.product_count} items</td>
                        <td className="font-mono text-xs">{c.order_count}</td>
                        <td className="font-bold text-blue-600">{c.total_items_sold}</td>
                        <td className="font-black text-purple-600">৳{Number(c.total_revenue).toLocaleString()}</td>
                        <td className="text-xs font-medium text-gray-600 dark:text-gray-300">{c.best_selling_product || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Revenue Trend & Customer Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" /> Monthly Revenue Trend
                </h3>
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b">
                        <th>Month</th>
                        <th>Orders</th>
                        <th>Shoppers</th>
                        <th>Total Revenue</th>
                        <th>Avg Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueTrend.map(r => (
                        <tr key={r.month}>
                          <td className="font-bold">{r.month}</td>
                          <td>{r.order_count}</td>
                          <td>{r.unique_customers}</td>
                          <td className="font-black text-primary">৳{Number(r.revenue).toLocaleString()}</td>
                          <td>৳{Number(r.avg_order_value).toFixed(0)}</td>
                        </tr>
                      ))}
                      {revenueTrend.length === 0 && (
                        <tr><td colSpan="5" className="text-center py-4 text-gray-400">No monthly records</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Analytics */}
              <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Users size={18} className="text-blue-500" /> Customer Lifetime Analytics
                </h3>
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b">
                        <th>Shopper</th>
                        <th>Orders</th>
                        <th>Total Spent</th>
                        <th>Avg Ticket</th>
                        <th>Wishlist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerAnalytics.slice(0, 5).map(c => (
                        <tr key={c.customer_id}>
                          <td className="font-bold">{c.name}</td>
                          <td>{c.total_orders}</td>
                          <td className="font-black text-blue-600">৳{Number(c.total_spent).toLocaleString()}</td>
                          <td>৳{Number(c.avg_order_value).toFixed(0)}</td>
                          <td>{c.wishlist_count} items</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Table */}
        {(tab === 'overview' || tab === 'customers') && (
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-blue-500" /> Customer Accounts ({customers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px] tracking-wider">
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.customer_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="font-mono text-xs font-bold text-gray-400">#{c.customer_id}</td>
                      <td className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {c.name?.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                      </td>
                      <td className="text-gray-500 text-xs">{c.email}</td>
                      <td className="text-gray-500 text-xs">{c.phone || '—'}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${c.account_status === 'ACTIVE' ? 'badge-success text-white' : 'badge-error text-white'}`}>
                          {c.account_status}
                        </span>
                      </td>
                      <td>
                        {c.account_status === 'ACTIVE' ? (
                          <button
                            onClick={() => updateCustomerStatus(c.customer_id, 'SUSPENDED')}
                            className="btn btn-outline btn-error btn-xs rounded-lg font-bold gap-1"
                          >
                            <Ban size={12} /> Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateCustomerStatus(c.customer_id, 'ACTIVE')}
                            className="btn btn-outline btn-success btn-xs rounded-lg font-bold gap-1"
                          >
                            <CheckCircle size={12} /> Activate
                          </button>
                        )}
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
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Store size={18} className="text-green-500" /> Registered Sellers ({sellers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px] tracking-wider">
                    <th>ID</th>
                    <th>Vendor Name</th>
                    <th>Store Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map(s => (
                    <tr key={s.seller_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="font-mono text-xs font-bold text-gray-400">#{s.seller_id}</td>
                      <td className="font-bold text-gray-900 dark:text-white">{s.seller_name}</td>
                      <td>
                        <span className="badge badge-ghost font-bold text-xs">{s.shop_name}</span>
                      </td>
                      <td className="text-gray-500 text-xs">{s.email}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${s.status === 'ACTIVE'
                          ? 'badge-success text-white'
                          : s.status === 'PENDING'
                            ? 'badge-warning text-white'
                            : 'badge-error text-white'
                          }`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          {s.status !== 'ACTIVE' && (
                            <button
                              onClick={() => updateSellerStatus(s.seller_id, 'ACTIVE')}
                              className="btn btn-outline btn-success btn-xs rounded-lg font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {s.status !== 'SUSPENDED' && (
                            <button
                              onClick={() => updateSellerStatus(s.seller_id, 'SUSPENDED')}
                              className="btn btn-outline btn-error btn-xs rounded-lg font-bold"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
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
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={18} className="text-orange-500" /> Platform Orders ({orders.length})
                </h2>
                <p className="text-xs text-gray-400">Seller-managed preparation statuses are shown here; changes are recorded in the audit trail.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-400 uppercase text-[11px] tracking-wider">
                    <th>Order #</th>
                    <th>Customer Name</th>
                    <th>Total Amount</th>
                    <th>Order Status</th>
                    <th>Seller Preparation Status</th>
                    <th>Audit Trail</th>
                    <th>Date Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="font-mono font-bold text-gray-900 dark:text-white">#{o.order_id}</td>
                      <td className="text-gray-700 dark:text-gray-300 font-medium">{o.customer_name}</td>
                      <td className="font-black text-primary">৳{Number(o.total_amount || o.grand_total).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${o.order_status === 'DELIVERED'
                          ? 'badge-success text-white'
                          : o.order_status === 'CANCELLED'
                            ? 'badge-error text-white'
                            : 'badge-info text-white'
                          }`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {o.seller_statuses || 'No seller status available'}
                      </td>
                      <td>
                        <button
                          onClick={() => viewOrderAuditLog(o.order_id)}
                          className="btn btn-outline btn-xs rounded-lg font-bold gap-1 text-primary hover:bg-primary hover:text-white"
                        >
                          <History size={12} /> View Audit Trail
                        </button>
                      </td>
                      <td className="text-gray-400 text-xs">
                        {new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Order Status Audit Log */}
        {auditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-gray-800 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-base">
                      Order Status Audit Trail: Order #{selectedOrderForAudit}
                    </h3>
                    <p className="text-xs text-gray-400">Automatically captured when a seller updates preparation status.</p>
                  </div>
                </div>
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="btn btn-ghost btn-circle btn-sm text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>No status transitions recorded yet for this order.</p>
                    <p className="text-xs mt-1">Seller status changes are recorded automatically in the audit trail.</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.log_id}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-sm badge-ghost font-bold">{log.old_status || 'INITIAL'}</span>
                          <span className="text-gray-400">➔</span>
                          <span className="badge badge-sm badge-primary text-white font-bold">{log.new_status}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">Shadow Log ID: #{log.log_id}</span>
                      </div>
                      <span className="text-gray-400 text-[11px]">
                        {new Date(log.changed_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="btn btn-sm btn-primary text-white font-bold rounded-xl px-5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
