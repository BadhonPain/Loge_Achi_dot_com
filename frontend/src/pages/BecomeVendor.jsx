import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { vendorAccountSchema, vendorBusinessSchema, vendorStoreSchema } from '../schemas/authSchemas';
import {
  Store, TrendingUp, ShieldCheck, CheckCircle2, ChevronRight,
  Package, Headphones, Upload, User, Building2,
  Mail, FileText, Camera, Check, AlertCircle
} from 'lucide-react';

// ─── Step config ────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Account Info', icon: User },
  { id: 2, label: 'Business Info', icon: Building2 },
  { id: 3, label: 'Verification', icon: FileText },
  { id: 4, label: 'Store Setup', icon: Camera },
];

const INITIAL = {
  // Step 1
  fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  // Step 2
  businessName: '', businessType: '', category: '', address: '', city: '', tradeLicense: '',
  // Step 3
  nidFront: null, nidBack: null, selfie: null, bankName: '', accountNumber: '', branchName: '',
  // Step 4
  storeName: '', storeSlogan: '', storeLogo: null, agreedToTerms: false,
};

const BUSINESS_TYPES = ['Sole Proprietorship', 'Partnership', 'LLC / Private Ltd', 'Individual / Freelancer'];
const CATEGORIES = ['Electronics', 'Fashion & Apparel', 'Home & Living', 'Health & Beauty', 'Sports & Outdoors', 'Groceries', 'Books & Stationery', 'Toys & Baby', 'Automotive', 'Other'];

const InputField = ({ label, type = 'text', placeholder, value, onChange, required, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
    />
    {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
    >
      <option value="">Select an option…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const FileUpload = ({ label, hint, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-xl py-6 cursor-pointer transition-colors group">
      <Upload size={24} className="text-gray-400 group-hover:text-primary mb-2 transition-colors" />
      <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Click to upload</span>
      <span className="text-xs text-gray-400 mt-1">{hint}</span>
      <input type="file" className="hidden" onChange={onChange} accept="image/*,.pdf" />
    </label>
  </div>
);

// ─── BecomeVendor ────────────────────────────────────────────
const BecomeVendor = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0 = landing, 1-4 = form steps, 5 = success
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { registerSeller } = useContext(AuthContext);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const setFile = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.files[0] }));

  const validateStep = (step) => {
    const schema = {
      1: vendorAccountSchema,
      2: vendorBusinessSchema,
      4: vendorStoreSchema,
    }[step];
    if (!schema) return true;

    const validation = schema.safeParse(form);
    const errs = validation.success
      ? {}
      : Object.fromEntries(validation.error.issues.map((issue) => [issue.path[0], issue.message]));
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const back = () => { setCurrentStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await registerSeller(
        form.fullName,
        form.storeName || form.businessName,
        form.email,
        form.password,
        form.phone,
        `${form.address}, ${form.city}`
      );
      if (res && res.success) {
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(res?.message || 'Failed to submit application. Please check details.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to register seller');
    } finally {
      setSubmitting(false);
    }
  };

  const err = (field) => errors[field] ? (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors[field]}</p>
  ) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] dark:bg-gray-950 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* ── LANDING PAGE ── */}
        {currentStep === 0 && (
          <>
            {/* Hero */}
            <section className="relative bg-gray-900 text-white py-24 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop"
                  alt="Vendor"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
              </div>

              <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
                {/* Left copy */}
                <div className="flex-1 text-center lg:text-left">
                  <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">LogeAchi Seller Center</span>
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                    Grow Your Business<br />
                    <span className="text-primary">With Millions</span> of Buyers
                  </h1>
                  <p className="text-lg text-gray-300 mb-4 max-w-xl mx-auto lg:mx-0">
                    Join 50,000+ sellers across Bangladesh. Set up your official store in minutes — 0% commission for the first 30 days.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10">
                    {['Free Registration', '0% First Month Commission', 'Dedicated Support'].map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 text-sm text-gray-300 bg-white/10 px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={14} className="text-primary" /> {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-primary hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-primary/30 hover:scale-105 inline-block"
                  >
                    Start Selling Now →
                  </button>
                </div>

                {/* Stats card */}
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: '50K+', label: 'Active Sellers' },
                      { value: '2M+', label: 'Customers' },
                      { value: '৳100Cr+', label: 'Monthly GMV' },
                      { value: '64', label: 'Districts Served' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                        <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
                        <p className="text-xs text-gray-300 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-white dark:bg-gray-900">
              <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Why Sell on LogeAchi?</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    We provide the best tools, logistics, and audience to help your business scale effortlessly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: TrendingUp, title: 'Massive Audience', desc: 'Reach 2M+ active shoppers browsing daily for products exactly like yours.', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
                    { icon: Store, title: 'Easy Store Setup', desc: 'Customise your storefront, manage inventory and track sales in one dashboard.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
                    { icon: ShieldCheck, title: 'Secure Payments', desc: 'Guaranteed weekly payouts straight to your bank — full transparency.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
                    { icon: Headphones, title: 'Dedicated Support', desc: '24/7 seller support via chat, phone and email to help you grow faster.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
                  ].map(({ icon: Icon, title, desc, color, bg }) => (
                    <div key={title} className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center ${color} mb-5 group-hover:scale-110 transition-transform`}>
                        <Icon size={26} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Steps */}
            <section className="py-20 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
              <div className="max-w-4xl mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-14 text-center">
                  4 Simple Steps to Start Selling
                </h2>
                <div className="space-y-4">
                  {[
                    { step: '01', icon: User, title: 'Create Your Account', desc: 'Fill out your personal details and verify your identity securely.' },
                    { step: '02', icon: Building2, title: 'Add Business Info', desc: 'Tell us about your business type, category, and location.' },
                    { step: '03', icon: FileText, title: 'Submit Verification', desc: 'Upload your NID and trade license. Approval typically takes 24 hours.' },
                    { step: '04', icon: Package, title: 'Launch Your Store', desc: 'Set up your storefront, list products, and start receiving orders!' },
                  ].map(({ step, icon: Icon, title, desc }, idx) => (
                    <div key={idx} className="flex items-start gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors group">
                      <div className="w-14 h-14 shrink-0 bg-gray-900 dark:bg-primary text-white rounded-2xl flex flex-col items-center justify-center group-hover:bg-primary transition-colors">
                        <Icon size={18} />
                        <span className="text-[9px] font-bold opacity-60 mt-0.5">{step}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 self-center group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-primary hover:bg-orange-600 text-white px-12 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-primary/30 hover:scale-105"
                  >
                    Register Now — It's Free
                  </button>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-10">Trusted by Sellers Across Bangladesh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Karim Electronics', city: 'Dhaka', revenue: '৳4.5 Lakh/mo', quote: 'LogeAchi tripled my online sales in just 3 months. The dashboard is incredibly easy to use.' },
                    { name: 'Fashionista BD', city: 'Chittagong', revenue: '৳2.1 Lakh/mo', quote: 'The 0% commission offer gave me the confidence to go fully online. Never looked back!' },
                    { name: 'GreenMart Grocery', city: 'Sylhet', revenue: '৳1.8 Lakh/mo', quote: 'Delivery was always my pain point. LogeAchi\'s logistics partner solved it completely.' },
                  ].map(seller => (
                    <div key={seller.name} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700 text-left">
                      <div className="flex items-center gap-1 text-amber-400 mb-4">
                        {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5 italic">"{seller.quote}"</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{seller.name}</p>
                          <p className="text-xs text-gray-400">{seller.city}</p>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{seller.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── MULTI-STEP FORM ── */}
        {currentStep >= 1 && currentStep <= 4 && (
          <section className="py-12">
            <div className="max-w-2xl mx-auto px-4 md:px-6">

              {/* Step Progress */}
              <div className="mb-10">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                  />
                  {STEPS.map((step) => {
                    const StepIcon = step.icon;
                    const done = currentStep > step.id;
                    const active = currentStep === step.id;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-primary border-primary text-white' : active ? 'border-primary text-primary bg-white dark:bg-gray-950' : 'border-gray-200 dark:border-gray-700 text-gray-400 bg-white dark:bg-gray-950'}`}>
                          {done ? <Check size={18} /> : <StepIcon size={18} />}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {STEPS[currentStep - 1].label}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                  Step {currentStep} of {STEPS.length}
                </p>

                {/* STEP 1: Account Info */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <InputField label="Full Name" placeholder="Md. Rahim Uddin" value={form.fullName} onChange={set('fullName')} required />
                    {err('fullName')}
                    <InputField label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                    {err('email')}
                    <InputField label="Phone Number" type="tel" placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={set('phone')} required />
                    {err('phone')}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <InputField label="Password" type="password" placeholder="6+ letters and numbers" value={form.password} onChange={set('password')} required hint="Use at least 6 letters and numbers, with at least one of each." />
                        {err('password')}
                      </div>
                      <div>
                        <InputField label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                        {err('confirmPassword')}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Business Info */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <InputField label="Business Name" placeholder="Your Shop / Brand Name" value={form.businessName} onChange={set('businessName')} required />
                    {err('businessName')}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <SelectField label="Business Type" value={form.businessType} onChange={set('businessType')} options={BUSINESS_TYPES} required />
                        {err('businessType')}
                      </div>
                      <div>
                        <SelectField label="Main Category" value={form.category} onChange={set('category')} options={CATEGORIES} required />
                        {err('category')}
                      </div>
                    </div>
                    <InputField label="Business Address" placeholder="Street, Thana, District" value={form.address} onChange={set('address')} required />
                    {err('address')}
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="City" placeholder="Dhaka" value={form.city} onChange={set('city')} />
                      <InputField label="Trade License No." placeholder="Optional" value={form.tradeLicense} onChange={set('tradeLicense')} hint="If applicable" />
                    </div>
                  </div>
                )}

                {/* STEP 3: Verification */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300 flex gap-3">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>Upload clear photos. All documents are encrypted and used only for verification. Approval within 24 hours.</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FileUpload label="NID — Front Side" hint="JPG, PNG, PDF · Max 5MB" onChange={setFile('nidFront')} />
                      <FileUpload label="NID — Back Side" hint="JPG, PNG, PDF · Max 5MB" onChange={setFile('nidBack')} />
                    </div>
                    <FileUpload label="Selfie Holding NID" hint="Must be clear and well-lit" onChange={setFile('selfie')} />
                    <hr className="border-gray-100 dark:border-gray-700" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Bank Account Details</h3>
                    <InputField label="Bank Name" placeholder="e.g. Dutch-Bangla Bank" value={form.bankName} onChange={set('bankName')} />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Account Number" placeholder="Your account number" value={form.accountNumber} onChange={set('accountNumber')} />
                      <InputField label="Branch Name" placeholder="e.g. Gulshan Branch" value={form.branchName} onChange={set('branchName')} />
                    </div>
                  </div>
                )}

                {/* STEP 4: Store Setup */}
                {currentStep === 4 && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <InputField label="Store Name" placeholder="e.g. Rahim's Tech Hub" value={form.storeName} onChange={set('storeName')} required />
                    {err('storeName')}
                    <InputField label="Store Slogan" placeholder="A short catchy tagline (optional)" value={form.storeSlogan} onChange={set('storeSlogan')} />
                    <FileUpload label="Store Logo" hint="Square image, JPG/PNG · Min 300x300px" onChange={setFile('storeLogo')} />

                    <div className="flex items-start gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={form.agreedToTerms}
                        onChange={e => setForm(p => ({ ...p, agreedToTerms: e.target.checked }))}
                        className="mt-1 accent-primary w-4 h-4"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                        I agree to the{' '}
                        <Link to="#" className="text-primary underline">Seller Terms & Conditions</Link>{' '}
                        and{' '}
                        <Link to="#" className="text-primary underline">Privacy Policy</Link>
                      </label>
                    </div>
                    {err('agreedToTerms')}
                  </form>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                  {currentStep > 1 ? (
                    <button onClick={back} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary font-medium text-sm transition-colors">
                      ← Back
                    </button>
                  ) : (
                    <button onClick={() => setCurrentStep(0)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary font-medium text-sm transition-colors">
                      ← Back to Info
                    </button>
                  )}

                  {submitError && (
                    <div className="w-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
                      <AlertCircle size={16} /> {submitError}
                    </div>
                  )}

                  {currentStep < 4 ? (
                    <button onClick={next} className="bg-primary hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105">
                      Continue →
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={submitting} className="bg-primary hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2">
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SUCCESS ── */}
        {currentStep === 5 && (
          <section className="py-20">
            <div className="max-w-lg mx-auto px-4 md:px-6 text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                Application Submitted! 🎉
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Congratulations, <strong className="text-gray-900 dark:text-white">{form.fullName || 'Seller'}</strong>!
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Your seller account for <strong className="text-primary">{form.storeName || 'your store'}</strong> has been created and is active.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-left mb-8 space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">What happens next?</h3>
                {[
                  { icon: Mail, text: 'You will receive a confirmation email shortly.' },
                  { icon: Store, text: 'Your seller account has been registered with active status.' },
                  { icon: Package, text: 'You can now list products, manage inventory and track orders.' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                      <Icon size={15} />
                    </div>
                    {text}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/seller-dashboard" className="bg-primary hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105 inline-block text-center shadow-lg shadow-primary/20">
                  Go to Seller Dashboard →
                </Link>
                <Link to="/" className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-8 py-3 rounded-full transition-all hover:border-primary hover:text-primary inline-block text-center">
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BecomeVendor;
