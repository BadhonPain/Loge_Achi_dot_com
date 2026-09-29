import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { customerRegistrationSchema } from '../schemas/authSchemas';

const Signup = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validation = customerRegistrationSchema.safeParse(form);
    if (!validation.success) {
      const msg = validation.error.issues[0].message;
      setError(msg);
      toast.warn(msg);
      return;
    }
    const values = validation.data;
    setLoading(true);
    const result = await register(values.name, values.email, values.password, values.phone);
    setLoading(false);
    if (result.success) {
      toast.success(`Account created successfully! Welcome to LogeAchi! 🎉`);
      navigate('/');
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
            <p className="text-gray-400 text-sm">Create your customer account</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="alert alert-error text-white text-xs font-medium p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                  <input value={form.name} onChange={set('name')} placeholder="Your full name" required className={inputClass} />
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="6+ letters and numbers" required className="input input-bordered w-full pl-10 pr-10 rounded-xl text-sm" />
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
                  'Create Customer Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </div>
            {user?.role !== 'SELLER' && (
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Want to sell on LogeAchi?{' '}
                <Link to="/seller" className="text-primary font-bold hover:underline">Apply to become a vendor</Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
