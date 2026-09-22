import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const API = 'http://localhost:5000/api';

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'CUSTOMER') { navigate('/'); return; }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/my`);
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    CONFIRMED: { color: 'bg-blue-100 text-blue-700', icon: Package },
    PROCESSING: { color: 'bg-indigo-100 text-indigo-700', icon: Package },
    SHIPPED: { color: 'bg-purple-100 text-purple-700', icon: Truck },
    DELIVERED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    CANCELLED: { color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">My Orders</h1>

        {error && <div className="bg-red-50 dark:bg-red-950 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const config = statusConfig[order.order_status] || statusConfig.PENDING;
              const StatusIcon = config.icon;
              return (
                <div key={order.order_id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                        <StatusIcon size={24} />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 dark:text-white text-lg">Order #{order.order_id}</p>
                        <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-primary">৳{Number(order.total_amount).toLocaleString()}</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>{order.order_status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
