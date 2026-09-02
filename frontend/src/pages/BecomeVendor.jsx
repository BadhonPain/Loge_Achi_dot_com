import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Store, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

const BecomeVendor = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] font-sans">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gray-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop" 
              alt="Vendor Business" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">LogeAchi Seller Center</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Grow Your Business With Us
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto md:mx-0">
                Reach millions of customers nationwide. Set up your official store today with 0% commission for the first 30 days.
              </p>
              <button className="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105">
                Start Selling Now
              </button>
            </div>
            
            {/* Quick Registration Card */}
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-gray-900">
              <h3 className="text-2xl font-bold mb-6 text-center">Create Seller Account</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Enter your shop name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="+880 1..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="you@example.com" />
                </div>
                <button type="button" className="w-full bg-gray-900 hover:bg-primary text-white font-bold py-3 rounded-lg transition-colors mt-2">
                  Register as Vendor
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Why Sell on LogeAchi?</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">We provide the best tools, logistics, and audience to help your business scale effortlessly.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
                  <TrendingUp size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Massive Audience</h3>
                <p className="text-gray-500">Access millions of active shoppers browsing daily for products exactly like yours.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
                  <Store size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Store Setup</h3>
                <p className="text-gray-500">Customize your storefront, manage inventory, and track sales with our intuitive dashboard.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
                <p className="text-gray-500">Guaranteed weekly payouts directly to your bank account with complete transparency.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-12 text-center">4 Simple Steps to Success</h2>
            
            <div className="space-y-8">
              {[
                { step: '1', title: 'Register your account', desc: 'Fill out the form with your business details and verify your identity.' },
                { step: '2', title: 'List your products', desc: 'Upload high-quality images and compelling descriptions of your items.' },
                { step: '3', title: 'Receive orders', desc: 'Customers place orders. You pack the items and our logistics team handles the delivery.' },
                { step: '4', title: 'Get paid', desc: 'Receive your payments securely every week directly to your registered bank account.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 shrink-0 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BecomeVendor;
