import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Package, Clock, CheckCircle, XCircle, Truck, Copy, MapPin, ExternalLink } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login?role=customer'); return; }
    if (user.role !== 'CUSTOMER') { navigate('/'); return; }
    loadOrders();
  }, [user]);

  useEffect(() => {
    if (!loading && highlightedOrderId) {
      document.getElementById(`order-${highlightedOrderId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, highlightedOrderId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/orders/my`);
      setOrders(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load orders';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success text-white font-bold text-xs">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="badge badge-error text-white font-bold text-xs">CANCELLED</span>;
      case 'ACCEPTED':
      case 'CONFIRMED':
        return <span className="badge badge-info text-white font-bold text-xs">{status}</span>;
      case 'SHIPPED':
        return <span className="badge badge-primary text-white font-bold text-xs">SHIPPED</span>;
      case 'READY':
      case 'READY_TO_SHIP':
        return <span className="badge badge-primary text-white font-bold text-xs">{status === 'READY_TO_SHIP' ? 'READY TO SHIP' : status}</span>;
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return <span className="badge badge-warning text-white font-bold text-xs">PENDING</span>;
      case 'PREPARING':
      default:
        return <span className="badge badge-warning text-white font-bold text-xs">{status || 'PENDING'}</span>;
    }
  };

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(String(id));
    toast.success(`Copied Order #${id} to clipboard! 📋`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Orders</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your order history</p>
          </div>
          <span className="badge badge-primary badge-outline font-bold px-3 py-2 text-xs">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </span>
        </div>

        {error && (
          <div className="alert alert-error text-white mb-6 text-sm font-medium shadow-md">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No orders placed yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-sm mx-auto">Once you check out with products, your order status and receipts will appear here.</p>
            <div>
              <Link to="/" className="btn btn-primary text-white font-bold px-8 rounded-xl shadow-lg shadow-primary/25">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                id={`order-${order.order_id}`}
                key={order.order_id}
                className={`card rounded-2xl border p-6 transition-shadow hover:shadow-md ${String(highlightedOrderId) === String(order.order_id)
                  ? 'border-primary/60 bg-primary/[0.035] ring-2 ring-primary/20 dark:bg-primary/[0.08]'
                  : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center shadow-sm">
                      <Package size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-900 dark:text-white text-lg">Order #{order.order_id}</p>
                        <button
                          onClick={() => handleCopyOrderId(order.order_id)}
                          title="Copy Order ID"
                          className="btn btn-ghost btn-xs text-gray-400 hover:text-primary p-1"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">৳{Number(order.grand_total || order.total_amount).toLocaleString()}</p>
                    <div className="mt-1 flex flex-wrap justify-end gap-2">
                      {order.seller_statuses?.length ? order.seller_statuses.map(sellerStatus => (
                        <span key={sellerStatus.seller_order_id} className="inline-flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{sellerStatus.seller_name}</span>
                          {getStatusBadge(sellerStatus.status)}
                        </span>
                      )) : getStatusBadge(order.order_status)}
                    </div>
                  </div>
                </div>

                {order.shipping_address_line1 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 truncate max-w-md">
                      <MapPin size={14} className="text-primary shrink-0" />
                      <span>Ship to: <strong>{order.shipping_name}</strong>, {order.shipping_address_line1}, {order.shipping_city}</span>
                    </span>
                    <span className="badge badge-ghost badge-sm text-[11px]">Free Shipping</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
