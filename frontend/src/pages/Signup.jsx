import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, User, Store, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';
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
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    let result;
    if (mode === 'customer') {
      result = await register(form.name, form.email, form.password, form.phone);
    } else {
      if (!form.seller_name || !form.shop_name) { setError('Seller name and shop name are required'); setLoading(false); return; }
      result = await registerSeller(form.seller_name, form.shop_name, form.email, form.password, form.phone, form.address);
    }
    setLoading(false);
    if (result.success) navigate(mode === 'seller' ? '/seller-dashboard' : '/');
    else setError(result.message);
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="bg-gray-900 dark:bg-gray-800 p-8 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">Join LogeAchi and start shopping or selling</p>
          </div>

          <div className="p-8">
            {/* Role Toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
              <button onClick={() => setMode('customer')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'customer' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}>
                <User size={16} /> Customer
              </button>
              <button onClick={() => setMode('seller')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'seller' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}>
                <Store size={16} /> Seller
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm font-medium">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer: Full Name */}
              {mode === 'customer' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
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
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                      <input value={form.seller_name} onChange={set('seller_name')} placeholder="Your name" required className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Shop Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Store size={18} /></div>
                      <input value={form.shop_name} onChange={set('shop_name')} placeholder="Your shop name" required className={inputClass} />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+880 1XXX-XXXXXX" className={inputClass} />
                </div>
              </div>
              {mode === 'seller' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Business Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={18} /></div>
                    <input value={form.address} onChange={set('address')} placeholder="Street, Thana, District" className={inputClass} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 6 chars" required className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary outline-none" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm</label>
                  <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary outline-none" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center h-12 mt-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : `Create ${mode === 'seller' ? 'Seller' : 'Customer'} Account`}
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
