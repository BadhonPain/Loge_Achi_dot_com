import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { MapPin, CreditCard, Truck, CheckCircle, Plus, ChevronRight } from 'lucide-react';

const API = 'http://localhost:5000/api';

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=confirm, 4=success
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New address form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', recipient_name: '', phone: '', address_line1: '', city: '', postal_code: '' });

  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [cartRes, addrRes] = await Promise.all([
        axios.get(`${API}/cart/${user.id}`),
        axios.get(`${API}/addresses/${user.id}/addresses`),
      ]);
      setCartItems(cartRes.data.data || []);
      setCartTotal(cartRes.data.cart_total || 0);
      setAddresses(addrRes.data.data || []);
      if (addrRes.data.data?.length > 0) {
        const def = addrRes.data.data.find(a => a.is_default) || addrRes.data.data[0];
        setSelectedAddress(def.address_id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/addresses/${user.id}/addresses`, { ...addrForm, country: 'Bangladesh', is_default: addresses.length === 0 });
      setShowAddForm(false);
      setAddrForm({ label: 'Home', recipient_name: '', phone: '', address_line1: '', city: '', postal_code: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address');
    }
  };

  const placeOrder = async () => {
    setError('');
    if (!selectedAddress) { setError('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/orders`, { address_id: selectedAddress, payment_method: paymentMethod });
      setOrderId(res.data.order_id);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary outline-none transition-all text-sm";

  const paymentMethods = [
    { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
    { id: 'MOBILE_BANKING', label: 'Mobile Banking', icon: '📱', desc: 'bKash, Nagad, Rocket' },
    { id: 'CARD', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard' },
    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', desc: 'Direct bank transfer' },
  ];

  // Step indicator
  const steps = [
    { num: 1, label: 'Address', icon: MapPin },
    { num: 2, label: 'Payment', icon: CreditCard },
    { num: 3, label: 'Confirm', icon: Truck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Step 4: Success */}
        {step === 4 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Order Placed!</h2>
            <p className="text-gray-500 mb-2">Your order <span className="font-bold text-primary">#{orderId}</span> has been confirmed</p>
            <p className="text-gray-400 text-sm mb-8">You will receive an update when the seller accepts your order</p>
            <div className="flex justify-center gap-4">
              <Link to="/orders" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">View Orders</Link>
              <Link to="/" className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:border-primary hover:text-primary transition-colors">Continue Shopping</Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Checkout</h1>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= s.num ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <s.icon size={16} /> {s.label}
                  </div>
                  {i < steps.length - 1 && <ChevronRight size={16} className="text-gray-400" />}
                </React.Fragment>
              ))}
            </div>

            {error && <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">{error}</div>}

            {/* STEP 1: Address */}
            {step === 1 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><MapPin size={20} className="text-primary" /> Delivery Address</h2>

                {addresses.length === 0 && !showAddForm && (
                  <p className="text-gray-500 mb-4">No saved addresses. Please add one below.</p>
                )}

                <div className="space-y-3 mb-4">
                  {addresses.map(addr => (
                    <label key={addr.address_id}
                      className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr.address_id ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}>
                      <input type="radio" name="address" value={addr.address_id} checked={selectedAddress === addr.address_id}
                        onChange={() => setSelectedAddress(addr.address_id)} className="hidden" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{addr.recipient_name} <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">{addr.label}</span></p>
                          <p className="text-sm text-gray-500 mt-1">{addr.address_line1}, {addr.city}{addr.postal_code ? ` - ${addr.postal_code}` : ''}</p>
                          <p className="text-sm text-gray-400">{addr.phone}</p>
                        </div>
                        {selectedAddress === addr.address_id && <CheckCircle size={20} className="text-primary flex-shrink-0" />}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Add Address Form */}
                {!showAddForm ? (
                  <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 text-primary font-medium text-sm hover:underline mb-6">
                    <Plus size={16} /> Add New Address
                  </button>
                ) : (
                  <form onSubmit={addAddress} className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <input value={addrForm.recipient_name} onChange={e => setAddrForm({...addrForm, recipient_name: e.target.value})} placeholder="Recipient Name" required className={inputClass} />
                    <input value={addrForm.phone} onChange={e => setAddrForm({...addrForm, phone: e.target.value})} placeholder="Phone" required className={inputClass} />
                    <input value={addrForm.address_line1} onChange={e => setAddrForm({...addrForm, address_line1: e.target.value})} placeholder="Street Address" required className="col-span-2 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary outline-none text-sm" />
                    <input value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} placeholder="City" required className={inputClass} />
                    <input value={addrForm.postal_code} onChange={e => setAddrForm({...addrForm, postal_code: e.target.value})} placeholder="Postal Code" className={inputClass} />
                    <div className="col-span-2 flex gap-3">
                      <button type="submit" className="bg-primary text-white px-5 py-2 rounded-xl font-medium text-sm">Save Address</button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-500 text-sm">Cancel</button>
                    </div>
                  </form>
                )}

                <button onClick={() => { if (selectedAddress) setStep(2); else setError('Select an address'); }}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: Payment */}
            {step === 2 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CreditCard size={20} className="text-primary" /> Payment Method</h2>
                <div className="space-y-3 mb-6">
                  {paymentMethods.map(pm => (
                    <label key={pm.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)} className="hidden" />
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{pm.label}</p>
                        <p className="text-xs text-gray-400">{pm.desc}</p>
                      </div>
                      {paymentMethod === pm.id && <CheckCircle size={20} className="text-primary ml-auto" />}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">Review Order</button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm */}
            {step === 3 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Truck size={20} className="text-primary" /> Order Review</h2>

                {/* Items summary */}
                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item.cart_item_id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ৳{Number(item.price).toLocaleString()}</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">৳{Number(item.line_total).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="text-gray-900 dark:text-white">৳{Number(cartTotal).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-500 font-bold">Free</span></div>
                  <div className="flex justify-between text-gray-500"><span>Payment</span><span className="text-gray-900 dark:text-white">{paymentMethods.find(p => p.id === paymentMethod)?.label}</span></div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-extrabold text-primary">৳{Number(cartTotal).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium">Back</button>
                  <button onClick={placeOrder} disabled={loading}
                    className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Place Order'}
                  </button>
                </div>
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
