import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Store, Shield, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const ROLE_INFO = {
  customer: {
    title: 'Customer Sign In',
    subtitle: 'Access your shopping cart, order history, and account settings.',
    buttonText: 'Sign In to Account',
    emailPlaceholder: 'e.g. customer@example.com',
  },
  seller: {
    title: 'Seller Central Sign In',
    subtitle: 'Manage your storefront inventory, track shipments, and process orders.',
    buttonText: 'Sign In to Seller Central',
    emailPlaceholder: 'e.g. seller@store.com',
  },
  admin: {
    title: 'Administrative Console',
    subtitle: 'Restricted administrative access for system governance, user and merchant management.',
    buttonText: 'Sign In to Admin Console',
    emailPlaceholder: 'e.g. admin@domain.com',
  },
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected portal tab: 'customer' | 'seller' | 'admin'
  const initialRole = searchParams.get('role')?.toLowerCase();
  const [activePortal, setActivePortal] = useState(
    initialRole === 'seller' || initialRole === 'admin' ? initialRole : 'customer'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync with URL query param if user arrived via navbar direct link
  useEffect(() => {
    const roleParam = searchParams.get('role')?.toLowerCase();
    if (roleParam === 'seller' || roleParam === 'admin' || roleParam === 'customer') {
      setActivePortal(roleParam);
      setError('');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      // Dynamic role redirection resolved securely by the database
      if (result.role === 'ADMIN') {
        navigate('/admin');
      } else if (result.role === 'SELLER') {
        navigate('/seller-dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Incorrect email or password. Please try again.');
    }
  };

  const portal = ROLE_INFO[activePortal] || ROLE_INFO.customer;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">

          {/* Portal Switcher Segmented Control */}
          <div className="p-6 pb-0">
            <div className="grid grid-cols-3 gap-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActivePortal('customer'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activePortal === 'customer'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User size={15} className={activePortal === 'customer' ? 'text-primary' : ''} />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => { setActivePortal('seller'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activePortal === 'seller'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Store size={15} className={activePortal === 'seller' ? 'text-orange-500' : ''} />
                <span>Seller Central</span>
              </button>

              <button
                type="button"
                onClick={() => { setActivePortal('admin'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activePortal === 'admin'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Shield size={15} className={activePortal === 'admin' ? 'text-red-500' : ''} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Card Header */}
          <div className="px-8 pt-6 pb-4">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {portal.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {portal.subtitle}
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 p-3.5 rounded-2xl flex items-start gap-3 mb-5 text-sm font-medium border border-red-200 dark:border-red-900/50 animate-fadeIn">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={portal.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-primary hover:underline font-semibold">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/20 accent-primary"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{portal.buttonText}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Context-sensitive Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
              {activePortal === 'customer' && (
                <div className="space-y-2">
                  <p>
                    Don't have a customer account?{' '}
                    <Link to="/signup" className="text-primary font-bold hover:underline">
                      Sign up now
                    </Link>
                  </p>
                  <p className="text-xs text-gray-400">
                    Are you a seller?{' '}
                    <button
                      type="button"
                      onClick={() => setActivePortal('seller')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in to Seller Central
                    </button>
                  </p>
                </div>
              )}

              {activePortal === 'seller' && (
                <div className="space-y-2">
                  <p>
                    Want to start selling on LogeAchi?{' '}
                    <Link to="/seller" className="text-primary font-bold hover:underline">
                      Register as a Vendor
                    </Link>
                  </p>
                  <p className="text-xs text-gray-400">
                    Are you a customer?{' '}
                    <button
                      type="button"
                      onClick={() => setActivePortal('customer')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in as Customer
                    </button>
                  </p>
                </div>
              )}

              {activePortal === 'admin' && (
                <div className="space-y-2 text-xs text-gray-400">
                  <p className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Shield size={14} className="text-red-500" />
                    <span>Authorized personnel only. All access attempts are recorded.</span>
                  </p>
                  <p>
                    Return to{' '}
                    <button
                      type="button"
                      onClick={() => setActivePortal('customer')}
                      className="text-primary hover:underline font-medium"
                    >
                      Standard Customer Sign In
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
