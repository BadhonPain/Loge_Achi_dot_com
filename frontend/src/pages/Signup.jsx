import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, User, Store, Mail, Lock, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Signup = () => {
  const { register, registerSeller } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState('customer');
  const [form, setForm] = useState({ name: '', seller_name: '', shop_name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.warn(msg);
      return;
    }
    if (form.password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setError(msg);
      toast.warn(msg);
      return;
    }
    setLoading(true);
    let result;
    if (mode === 'customer') {
      result = await register(form.name, form.email, form.password, form.phone);
    } else {
      if (!form.seller_name || !form.shop_name) {
        const msg = 'Seller name and shop name are required';
        setError(msg);
        toast.warn(msg);
        setLoading(false);
        return;
      }
      result = await registerSeller(form.seller_name, form.shop_name, form.email, form.password, form.phone, form.address);
    }
    setLoading(false);
    if (result.success) {
      toast.success(`Account created successfully! Welcome to LogeAchi! 🎉`);
      navigate(mode === 'seller' ? '/seller-dashboard' : '/');
    } else {
      const msg = result.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    }
  };

  const inputClass = "input input-bordered w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="card w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="bg-gray-900 dark:bg-gray-800 p-8 text-center">
            <h2 className="text-3xl font-black text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">Join LogeAchi and start shopping or selling</p>
          </div>

          <div className="p-8">
            {/* Role Toggle with DaisyUI tabs */}
            <div className="tabs tabs-boxed w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setMode('customer')}
                className={`tab flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'customer' ? 'tab-active bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
              >
                <User size={16} /> Customer
              </button>
              <button
                type="button"
                onClick={() => setMode('seller')}
                className={`tab flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'seller' ? 'tab-active bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
              >
                <Store size={16} /> Seller
              </button>
            </div>

            {error && (
              <div className="alert alert-error text-white text-xs font-medium p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer: Full Name */}
              {mode === 'customer' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                    <input value={form.name} onChange={set('name')} placeholder="Your full name" required className={inputClass} />
                  </div>
                </div>
              )}
              {/* Seller: Name + Shop */}
              {mode === 'seller' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Seller Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                      <input value={form.seller_name} onChange={set('seller_name')} placeholder="Your name" required className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Shop Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Store size={18} /></div>
                      <input value={form.shop_name} onChange={set('shop_name')} placeholder="Your shop name" required className={inputClass} />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+880 1XXX-XXXXXX" className={inputClass} />
                </div>
              </div>
              {mode === 'seller' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Business Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><MapPin size={18} /></div>
                    <input value={form.address} onChange={set('address')} placeholder="Street, Thana, District" className={inputClass} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 6 chars" required className="input input-bordered w-full pl-10 pr-10 rounded-xl text-sm" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm</label>
                  <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat" required
                    className="input input-bordered w-full px-4 rounded-xl text-sm" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold h-12 rounded-xl bg-primary hover:bg-orange-600 active:scale-[0.99] shadow-lg shadow-orange-500/25 disabled:opacity-50 inline-flex justify-center items-center gap-2 mt-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm text-white"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  `Create ${mode === 'seller' ? 'Seller' : 'Customer'} Account`
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
