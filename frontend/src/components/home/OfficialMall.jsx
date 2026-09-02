import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const brands = [
  { id: 1, name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=200&auto=format&fit=crop', product: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop', product: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Sony', logo: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=200&auto=format&fit=crop', product: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=400&auto=format&fit=crop' },
];

const OfficialMall = () => {
  return (
    <section className="py-12 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-primary"><ShieldCheck size={28} /></span>
              LogeAchi Mall
            </h2>
            <p className="text-sm text-gray-500 mt-1">100% Authentic Brands & Top Vendors</p>
          </div>
          
          <a href="#" className="text-gray-500 hover:text-primary text-sm font-medium flex items-center gap-1 group">
            See All Brands <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group cursor-pointer">
              {/* Product Banner */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={brand.product} 
                  alt={`${brand.name} Products`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              
              {/* Brand Logo & Info */}
              <div className="p-5 flex items-center gap-4 relative">
                <div className="w-16 h-16 rounded-lg bg-white shadow-md p-2 absolute -top-10 left-5 border border-gray-100 flex items-center justify-center overflow-hidden z-10">
                  <div className="font-bold text-gray-900 tracking-tighter text-sm uppercase">{brand.name}</div>
                </div>
                <div className="ml-20">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{brand.name}</h3>
                  <p className="text-xs text-gray-500">Official Store</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default OfficialMall;
