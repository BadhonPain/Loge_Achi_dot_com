import React from 'react';
import { 
  Smartphone, 
  MonitorPlay, 
  Sofa, 
  Shirt, 
  Dumbbell, 
  Baby, 
  Briefcase, 
  ChevronRight,
  Sparkles,
  Menu
} from 'lucide-react';

const categories = [
  { name: 'Tech & Gadgets', icon: <Smartphone size={18} strokeWidth={1.5} />, highlighted: true },
  { name: 'Home Entertainment', icon: <MonitorPlay size={18} strokeWidth={1.5} /> },
  { name: 'Furniture & Decor', icon: <Sofa size={18} strokeWidth={1.5} /> },
  { name: 'Fashion & Apparel', icon: <Shirt size={18} strokeWidth={1.5} /> },
  { name: 'Sports & Outdoors', icon: <Dumbbell size={18} strokeWidth={1.5} /> },
  { name: 'Kids & Babies', icon: <Baby size={18} strokeWidth={1.5} /> },
  { name: 'Office & Work', icon: <Briefcase size={18} strokeWidth={1.5} /> },
];

const CategoryMenu = () => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col overflow-hidden border border-gray-100">
      <div className="bg-gray-900 px-5 py-4">
        <h3 className="font-bold text-white text-sm tracking-widest uppercase flex items-center gap-2">
          <Menu size={16} /> Departments
        </h3>
      </div>
      <ul className="flex-1 py-3">
        {categories.map((category, index) => (
          <li key={index} className="group relative px-5 py-3 cursor-pointer">
            {/* Elegant hover background */}
            <div className="absolute inset-x-2 inset-y-1 rounded-xl bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <span className={`transition-colors duration-300 ${category.highlighted ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                  {category.icon}
                </span>
                <span className={`text-sm font-medium transition-colors duration-300 ${category.highlighted ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {category.name}
                </span>
                {category.highlighted && (
                  <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles size={10} /> Hot
                  </span>
                )}
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-all duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryMenu;
