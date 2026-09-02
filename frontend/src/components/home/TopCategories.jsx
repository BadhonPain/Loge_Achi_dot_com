import React from 'react';
import { ArrowRight } from 'lucide-react';

const categories = [
  { id: 1, name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop' },
  { id: 2, name: 'Men\'s Sneakers', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=200&auto=format&fit=crop' },
  { id: 3, name: 'Beauty & Skincare', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop' },
  { id: 4, name: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&auto=format&fit=crop' },
  { id: 5, name: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=200&auto=format&fit=crop' },
  { id: 6, name: 'Home Decor', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=200&auto=format&fit=crop' },
  { id: 7, name: 'Women\'s Fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200&auto=format&fit=crop' },
  { id: 8, name: 'Gaming Consoles', image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=200&auto=format&fit=crop' },
];

const TopCategories = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Top Categories</h2>
          <a href="#" className="text-gray-500 hover:text-primary text-sm font-medium flex items-center gap-1 group">
            Browse All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <a key={category.id} href="#" className="group flex flex-col items-center gap-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-primary transition-colors p-1 relative shadow-sm group-hover:shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TopCategories;
