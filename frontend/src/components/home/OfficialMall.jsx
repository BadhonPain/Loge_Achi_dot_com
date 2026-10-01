import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultVendorImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop'
];

const OfficialMall = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const res = await axios.get(`${API}/sellers`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSellers(res.data.data.slice(0, 6));
      }
    } catch (e) {
      // Fallback
    }
  };

  const handleOpenStore = async (seller) => {
    try {
      setSelectedSeller(seller);
      const res = await axios.get(`${API}/products?seller_id=${seller.seller_id}`);
      setSellerProducts(res.data.data || []);
      setModalOpen(true);
    } catch (e) {
      // ignore
    }
  };

  if (sellers.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900/60 border-y border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="text-primary"><ShieldCheck size={28} /></span>
              LogeAchi Mall
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">100% Authentic Brands & Top Verified Vendors</p>
          </div>

          <span className="badge badge-success text-white font-bold text-xs">
            {sellers.length} Verified Vendors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellers.map((seller, idx) => (
            <div
              key={seller.seller_id}
              onClick={() => handleOpenStore(seller)}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800 group cursor-pointer"
            >
              {/* Product Banner */}
              <div className="h-44 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={defaultVendorImages[idx % defaultVendorImages.length]}
                  alt={seller.shop_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 right-3">
                  <span className="badge badge-primary badge-sm text-white font-bold">
                    Visit Store →
                  </span>
                </div>
              </div>

              {/* Brand Logo & Info */}
              <div className="p-5 flex items-center gap-4 relative">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-md p-2 absolute -top-8 left-5 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden z-10 text-primary">
                  <Store size={26} />
                </div>
                <div className="ml-16">
                  <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-primary transition-colors text-base truncate">
                    {seller.shop_name}
                  </h3>
                  <p className="text-xs text-gray-400">By {seller.seller_name} · Verified Vendor</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Vendor Store Modal */}
      {modalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <Store size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {selectedSeller.shop_name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Vendor: {selectedSeller.seller_name} · {sellerProducts.length} Products Available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-circle btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sellerProducts.map((p) => (
                  <div
                    key={p.product_id}
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/product/${p.product_id}`);
                    }}
                    className="card bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white dark:bg-gray-900">
                      <img
                        src={p.primary_image || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                        alt={p.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate group-hover:text-primary">
                      {p.product_name}
                    </h4>
                    <p className="text-xs font-black text-primary mt-1">
                      ৳{Number(p.price).toLocaleString()}
                    </p>
                  </div>
                ))}
                {sellerProducts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    No products published by this vendor yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OfficialMall;
