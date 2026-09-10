import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Store, Shield, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const DEMO_CREDENTIALS = {
  customer: {
    email: 'customer@loge.com',
    password: 'customer123',
    roleLabel: 'Customer',
    desc: 'Shop products, manage your cart, checkout and track orders',
  },
  seller: {
    email: 'seller@apex.com',
    password: 'seller123',
    roleLabel: 'Seller / Vendor',
    desc: 'Manage your shop inventory, add products and update order status',
  },
  admin: {
    email: 'admin@loge.com',
    password: 'admin123',
    roleLabel: 'Platform Administrator',
    desc: 'Full platform oversight: user governance, seller approval and metrics',
  },
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected role tab: 'customer' | 'seller' | 'admin'
  const initialRole = searchParams.get('role')?.toLowerCase();
  const [selectedRole, setSelectedRole] = useState(
    initialRole === 'seller' || initialRole === 'admin' ? initialRole : 'customer'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync with searchParams if navigated with ?role=...
  useEffect(() => {
    const roleParam = searchParams.get('role')?.toLowerCase();
    if (roleParam === 'seller' || roleParam === 'admin' || roleParam === 'customer') {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Quick-fill demo credentials
  const fillDemo = (roleKey) => {
    const cred = DEMO_CREDENTIALS[roleKey];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Automatic role-based routing resolved from server DB
      if (result.role === 'ADMIN') {
        navigate('/admin');
      } else if (result.role === 'SELLER') {
        navigate('/seller-dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  const currentDemo = DEMO_CREDENTIALS[selectedRole];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
            <span className="text-primary text-xs font-black tracking-widest uppercase mb-1 block">LogeAchi Multi-Role Authentication</span>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              {selectedRole === 'admin' ? 'Admin Control Center' : selectedRole === 'seller' ? 'Seller & Vendor Portal' : 'Customer Account Login'}
            </h2>
            <p className="text-gray-300 text-sm max-w-md mx-auto">
              {currentDemo.desc}
            </p>
          </div>

          <div className="p-8">
            {/* Role Selection Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Select Your Role Portal
              </label>
              <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('customer'); setError(''); }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'customer'
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <User size={15} /> Customer
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRole('seller'); setError(''); }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'seller'
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Store size={15} /> Seller
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRole('admin'); setError(''); }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Shield size={15} /> Admin
                </button>
              </div>
            </div>

            {/* One-Click Quick Fill Demo Box */}
            <div className="bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-900/40 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Sparkles size={15} />
                  <span>One-Click Demo Account for {currentDemo.roleLabel}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-500 bg-white/80 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-900/40">
                  Ready to test
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                Email: <code className="font-mono font-bold text-gray-900 dark:text-white">{currentDemo.email}</code> | Pass: <code className="font-mono font-bold text-gray-900 dark:text-white">{currentDemo.password}</code>
              </p>
              <button
                type="button"
                onClick={() => fillDemo(selectedRole)}
                className="w-full bg-white dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-primary font-bold text-xs py-2 px-3 rounded-xl border border-primary/20 dark:border-primary/40 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles size={14} /> Auto-fill {currentDemo.roleLabel} Credentials
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 p-3.5 rounded-xl flex items-center gap-2 mb-6 text-sm font-medium border border-red-100 dark:border-red-900">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentDemo.email}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In as {currentDemo.roleLabel}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 text-center text-sm text-gray-500 dark:text-gray-400">
              <div>
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline">
                  Sign up now
                </Link>
              </div>
              <div>
                Want to sell on LogeAchi?{' '}
                <Link to="/seller" className="text-primary font-bold hover:underline">
                  Apply as a Vendor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
