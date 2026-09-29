import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { MapPin, CreditCard, Truck, CheckCircle, Plus, ChevronRight, AlertCircle, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const API = 'http://localhost:5000/api';

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const { clearCartState, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=confirm, 4=success
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  // New address form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: 'Home',
    recipient_name: '',
    phone: '',
    address_line1: '',
    city: 'Dhaka',
    postal_code: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?role=customer');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setPageLoading(true);
      const [cartRes, addrRes] = await Promise.all([
        axios.get(`${API}/cart/${user.id}`),
        axios.get(`${API}/addresses/${user.id}/addresses`),
      ]);

      const items = cartRes.data.data || [];
      setCartItems(items);
      setCartTotal(cartRes.data.cart_total || 0);

      const addrs = addrRes.data.data || [];
      setAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find(a => a.is_default) || addrs[0];
        setSelectedAddress(def.address_id);
      } else {
        setShowAddForm(true); // Automatically open address form if user has none!
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load checkout data');
    } finally {
      setPageLoading(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API}/addresses/${user.id}/addresses`, {
        ...addrForm,
        country: 'Bangladesh',
        is_default: addresses.length === 0
      });
      setShowAddForm(false);
      setAddrForm({ label: 'Home', recipient_name: '', phone: '', address_line1: '', city: 'Dhaka', postal_code: '' });
      await loadData();
      const newId = res.data?.address_id || res.data?.data?.address_id;
      if (newId) {
        setSelectedAddress(newId);
      }
      toast.success('Delivery address saved successfully! 📍');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save address';
      setError(msg);
      toast.error(msg);
    }
  };

  const placeOrder = async () => {
    setError('');
    if (!selectedAddress) {
      const msg = 'Please select or add a delivery address';
      setError(msg);
      toast.warn(msg);
      return;
    }
    setLoading(true);
    try {
      // PRE-FLIGHT STOCK VALIDATION — Re-fetch cart with live stock data
      // before hitting the order endpoint. Catches stock changes between
      // add-to-cart and checkout (e.g., admin sets stock=0, trigger fires OUT_OF_STOCK).
      const freshCartRes = await axios.get(`${API}/cart/${user.id}`);
      const freshItems = freshCartRes.data.data || [];

      const outOfStockItems = freshItems.filter(
        item => item.status !== 'ACTIVE' || item.quantity > item.stock_quantity
      );

      if (outOfStockItems.length > 0) {
        const names = outOfStockItems.map(i => `"${i.product_name}"`).join(', ');
        const msg = `Cannot place order — ${names} ${outOfStockItems.length === 1 ? 'is' : 'are'} out of stock or unavailable. Please remove ${outOfStockItems.length === 1 ? 'it' : 'them'} from your cart.`;
        setError(msg);
        toast.error(msg, { autoClose: 6000 });
        // Refresh cart display so the OUT_OF_STOCK badge shows immediately
        setCartItems(freshItems);
        setCartTotal(freshCartRes.data.cart_total || 0);
        setLoading(false);
        return;
      }

      // All items are ACTIVE with sufficient stock — proceed to place order
      const res = await axios.post(`${API}/orders`, {
        address_id: selectedAddress,
        payment_method: paymentMethod
      });

      setOrderId(res.data.order_id);
      clearCartState(); // Instantly clears navbar live counter to 0!
      setStep(4);
      toast.success(`Order #${res.data.order_id} placed successfully! 🎉`);
    } catch (err) {
      console.error('Place Order Error:', err.response?.data);
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const paymentMethods = [
    { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: '💵', desc: 'Pay with cash upon arrival at your doorstep' },
    { id: 'MOBILE_BANKING', label: 'Mobile Banking', icon: '📱', desc: 'bKash, Nagad, Rocket Instant Payment' },
    { id: 'CARD', label: 'Credit or Debit Card', icon: '💳', desc: 'Visa, Mastercard, AMEX Secured by SSL' },
    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', desc: 'Direct electronic fund transfer' },
  ];

  const steps = [
    { num: 1, label: 'Shipping Address', icon: MapPin },
    { num: 2, label: 'Payment Method', icon: CreditCard },
    { num: 3, label: 'Review & Confirm', icon: Truck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Step 4: Success Screen */}
        {step === 4 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 max-w-lg mx-auto animate-fadeIn">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-950/60 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle size={44} />
            </div>
            <span className="text-xs font-black tracking-widest text-green-600 uppercase mb-2 block">Payment Confirmed</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order #{orderId} Placed!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Thank you for shopping with LogeAchi. Your order is pending seller confirmation and will update as each seller processes it.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 text-left mb-8 space-y-2 text-xs border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Order Reference:</span>
                <span className="font-bold text-gray-900 dark:text-white">#{orderId}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Payment Mode:</span>
                <span className="font-bold text-gray-900 dark:text-white">{paymentMethods.find(p => p.id === paymentMethod)?.label}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Status:</span>
                <span className="font-bold text-primary">CONFIRMED</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/orders" className="bg-primary hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 text-center text-sm">
                View My Orders
              </Link>
              <Link to="/" className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3.5 rounded-xl font-semibold hover:border-primary hover:text-primary transition-colors text-center text-sm">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Checkout</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete your order with safe and verified checkout</p>
            </div>

            {/* DaisyUI Responsive Steps Indicator */}
            <ul className="steps steps-horizontal w-full mb-8 bg-white dark:bg-gray-900 py-4 px-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs">
              <li className={`step ${step >= 1 ? 'step-primary font-bold' : 'text-gray-400'}`}>Delivery Address</li>
              <li className={`step ${step >= 2 ? 'step-primary font-bold' : 'text-gray-400'}`}>Payment Mode</li>
              <li className={`step ${step >= 3 ? 'step-primary font-bold' : 'text-gray-400'}`}>Order Confirmation</li>
            </ul>

            {error && (
              <div className="alert alert-error text-white mb-6 text-sm font-medium shadow-md">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {pageLoading ? (
              <div className="flex justify-center py-20">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
                <ShoppingBag size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
                <div>
                  <Link to="/" className="btn btn-primary text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/25">
                    Browse Products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* STEP 1: Address Selection */}
                {step === 1 && (
                  <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin size={20} className="text-primary" /> Delivery Address
                      </h2>
                      {!showAddForm && addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAddForm(true)}
                          className="btn btn-primary btn-outline btn-xs rounded-lg gap-1 font-bold"
                        >
                          <Plus size={13} /> Add New Address
                        </button>
                      )}
                    </div>

                    {/* Saved Addresses List */}
                    {addresses.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {addresses.map(addr => (
                          <label
                            key={addr.address_id}
                            className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress === addr.address_id
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                                : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                              }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={addr.address_id}
                              checked={selectedAddress === addr.address_id}
                              onChange={() => { setSelectedAddress(addr.address_id); setError(''); }}
                              className="radio radio-primary radio-sm mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{addr.recipient_name}</span>
                                <span className="badge badge-primary badge-sm text-[10px] font-bold">{addr.label || 'Home'}</span>
                                {addr.is_default ? (
                                  <span className="badge badge-ghost badge-sm text-[10px] font-semibold">Default</span>
                                ) : null}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{addr.address_line1}, {addr.city} {addr.postal_code ? `- ${addr.postal_code}` : ''}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Contact: {addr.phone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Inline Add Address Form with DaisyUI Inputs */}
                    {showAddForm && (
                      <form onSubmit={addAddress} className="card bg-gray-50 dark:bg-gray-800/70 p-5 rounded-2xl mb-6 border border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            Add New Delivery Location
                          </h3>
                          {addresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowAddForm(false)}
                              className="btn btn-ghost btn-xs text-gray-400 hover:text-gray-600"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Recipient Name *</label>
                            <input
                              required
                              value={addrForm.recipient_name}
                              onChange={e => setAddrForm({ ...addrForm, recipient_name: e.target.value })}
                              placeholder="e.g. John Doe"
                              className="input input-bordered input-sm w-full bg-white dark:bg-gray-900 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Phone Number *</label>
                            <input
                              required
                              value={addrForm.phone}
                              onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })}
                              placeholder="e.g. +8801700000000"
                              className="input input-bordered input-sm w-full bg-white dark:bg-gray-900 rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Street Address *</label>
                          <input
                            required
                            value={addrForm.address_line1}
                            onChange={e => setAddrForm({ ...addrForm, address_line1: e.target.value })}
                            placeholder="e.g. House 12, Road 5, Block B, Mirpur"
                            className="input input-bordered input-sm w-full bg-white dark:bg-gray-900 rounded-xl"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">City / District *</label>
                            <input
                              required
                              value={addrForm.city}
                              onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                              placeholder="e.g. Dhaka"
                              className="input input-bordered input-sm w-full bg-white dark:bg-gray-900 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Postal Code</label>
                            <input
                              value={addrForm.postal_code}
                              onChange={e => setAddrForm({ ...addrForm, postal_code: e.target.value })}
                              placeholder="e.g. 1216"
                              className="input input-bordered input-sm w-full bg-white dark:bg-gray-900 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm text-white font-bold rounded-xl"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedAddress) {
                          setError('');
                          setStep(2);
                        } else {
                          setError('Please select or add a delivery address to continue');
                          toast.warn('Please select or add a delivery address to continue');
                        }
                      }}
                      className="btn btn-primary btn-block text-white font-bold h-12 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      <span>Continue to Payment Method</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                {/* STEP 2: Payment Method */}
                {step === 2 && (
                  <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <CreditCard size={20} className="text-primary" /> Select Payment Method
                    </h2>

                    <div className="space-y-3 mb-8">
                      {paymentMethods.map(pm => (
                        <label
                          key={pm.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id
                              ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                              : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={pm.id}
                            checked={paymentMethod === pm.id}
                            onChange={() => setPaymentMethod(pm.id)}
                            className="radio radio-primary radio-sm"
                          />
                          <span className="text-3xl">{pm.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{pm.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{pm.desc}</p>
                          </div>
                          {paymentMethod === pm.id && (
                            <span className="badge badge-primary badge-sm text-white font-bold">Selected</span>
                          )}
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-outline flex-1 rounded-2xl font-bold h-12"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="btn btn-primary flex-1 text-white font-bold h-12 rounded-2xl shadow-lg shadow-primary/25"
                      >
                        Review Order →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Order Review */}
                {step === 3 && (
                  <div className="card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <Truck size={20} className="text-primary" /> Review & Confirm Order
                    </h2>

                    {/* Items List */}
                    <div className="space-y-3 mb-6">
                      {cartItems.map(item => (
                        <div key={item.cart_item_id} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 text-sm">
                          <div className="pr-4">
                            <p className="font-bold text-gray-900 dark:text-white">{item.product_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Quantity: {item.quantity} × ৳{Number(item.price).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-black text-gray-900 dark:text-white shrink-0">
                            ৳{Number(item.line_total).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary with DaisyUI styled box */}
                    <div className="card bg-gray-50 dark:bg-gray-800/60 p-5 mb-8 space-y-2.5 text-xs border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-gray-900 dark:text-white">৳{Number(cartTotal).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Shipping Cost</span>
                        <span className="badge badge-success badge-xs text-white font-bold">FREE DELIVERY</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Payment Method</span>
                        <span className="font-bold text-gray-900 dark:text-white">{paymentMethods.find(p => p.id === paymentMethod)?.label}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between items-baseline text-sm">
                        <span className="font-black text-gray-900 dark:text-white">Total Amount Due</span>
                        <span className="font-black text-primary text-xl">৳{Number(cartTotal).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="btn btn-outline flex-1 rounded-2xl font-bold h-12"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={placeOrder}
                        disabled={loading}
                        className="btn btn-primary flex-1 text-white font-bold h-12 rounded-2xl shadow-lg shadow-primary/25 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            <span>Processing Order...</span>
                          </>
                        ) : (
                          'Confirm & Place Order'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
