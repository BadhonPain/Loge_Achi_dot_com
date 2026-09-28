import { ArrowUpRight, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Footer.css';

const customerLinks = [
  { label: 'Help Center', to: '/info/help-center' },
  { label: 'How to Buy', to: '/info/how-to-buy' },
  { label: 'Returns & Refunds', to: '/info/returns-refunds' },
  { label: 'Corporate Vouchers', to: '/info/corporate-vouchers' },
];

const brandLinks = [
  { label: 'About Us', to: '/info/about-us' },
  { label: 'Careers', to: '/info/careers' },
  { label: 'LogeAchi Blog', to: '/info/blog' },
  { label: 'Terms & Conditions', to: '/info/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/info/privacy-policy' },
];

const paymentMethods = [
  { id: 'bkash', label: 'bKash' },
  { id: 'nagad', label: 'Nagad' },
  { id: 'amex', label: 'American Express' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'visa', label: 'Visa' },
  { id: 'cod', label: 'Cash on delivery' },
];

const Footer = () => {
  const { pathname } = useLocation();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent('LogeAchi newsletter subscription');
    const body = encodeURIComponent(`Please add this email to the newsletter: ${newsletterEmail}`);
    window.location.href = `mailto:support@logeachi.com?subject=${subject}&body=${body}`;
  };

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
            <a href="mailto:support@logeachi.com" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition-colors hover:text-primary">
              Talk to our team <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Customer Care</h3>
            <ul className="space-y-3">
              {customerLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-nav-link">
                    {item.label}<ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
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
              {brandLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-nav-link">
                    {item.label}<ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Contact Us</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <a href="https://maps.google.com/?q=Dhaka,Bangladesh" target="_blank" rel="noreferrer" className="footer-contact-link text-sm">Dhaka, Bangladesh</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <a href="tel:+8801234567890" className="footer-contact-link text-sm">+880 1234 567890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <a href="mailto:support@logeachi.com" className="footer-contact-link text-sm">support@logeachi.com</a>
              </li>
            </ul>

            <form className="relative" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                required
                aria-label="Your email address"
                placeholder="Your email address"
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
              <button type="submit" aria-label="Subscribe by email" className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-orange-600 text-white px-4 rounded-md text-sm font-medium transition-colors">
                <Mail size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LogeAchi.com. All Rights Reserved.
          </p>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Accepted payments</span>
            <div className="flex flex-wrap justify-center gap-2 md:justify-end">
              {paymentMethods.map((method) => (
                <span key={method.id} className="footer-payment-mark" title={method.label}>
                  <svg role="img" aria-label={method.label} viewBox="0 0 150 50">
                    <use href={`/payment-logos.svg#${method.id}`} />
                  </svg>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
