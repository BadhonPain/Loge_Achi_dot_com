import { Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const { pathname } = useLocation();

  return (
    <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand Info */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-extrabold tracking-tighter text-white">
                Loge<span className="text-primary">Achi</span>.
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your ultimate multi-vendor marketplace. Discover premium products from verified sellers with 100% secure payment and fast delivery.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                {/* Facebook SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                {/* Twitter SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                {/* Instagram SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                {/* Youtube SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Customer Care</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">How to Buy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Track Your Order</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Corporate Vouchers</a></li>
            </ul>
          </div>

          {/* LogeAchi Links */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">LogeAchi</h3>
            <ul className="space-y-3">
              {pathname !== '/why-logeachi' && (
                <li>
                  <Link to="/why-logeachi" className="footer-why-link inline-flex items-center gap-2 text-sm font-semibold">
                    <Sparkles size={14} /> Why LogeAchi?
                  </Link>
                </li>
              )}
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">LogeAchi Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Contact Us</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">123 E-commerce Avenue, Tech District, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span className="text-gray-400 text-sm">+880 1234 567890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span className="text-gray-400 text-sm">support@logeachi.com</span>
              </li>
            </ul>

            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-orange-600 text-white px-4 rounded-md text-sm font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LogeAchi.com. All Rights Reserved.
          </p>

          {/* Payment Methods Placeholder */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm mr-2">Payment Methods:</span>
            <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">VISA</div>
            <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">MC</div>
            <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">BKASH</div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
