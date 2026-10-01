import { useEffect, useState } from 'react';
import {
  Smartphone,
  MonitorPlay,
  Sofa,
  Shirt,
  Dumbbell,
  Baby,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Menu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const departmentIcons = [Smartphone, MonitorPlay, Sofa, Shirt, Dumbbell, Baby, Briefcase];

const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`)
      .then(({ data }) => {
        if (active) setCategories((data.data || []).filter((category) => category.status === 'ACTIVE'));
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col overflow-hidden border border-gray-100">
      <div className="bg-gray-900 px-5 py-4">
        <h3 className="font-bold text-white text-sm tracking-widest uppercase flex items-center gap-2">
          <Menu size={16} /> Departments
        </h3>
      </div>
      <ul className="flex-1 py-3">
        {categories.slice(0, 7).map((category, index) => {
          const DepartmentIcon = departmentIcons[index % departmentIcons.length];
          return (
            <li key={category.category_id} className="group relative px-3 py-1.5">
              {/* Elegant hover background */}
              <div className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <Link to={`/categories?categoryId=${category.category_id}`} className="relative flex items-center justify-between z-10 rounded-lg px-2 py-2">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 group-hover:text-primary transition-colors duration-300">
                    <DepartmentIcon size={18} strokeWidth={1.5} />
                  </span>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                    {category.category_name}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-all duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
              </Link>
            </li>
          );
        })}
        {categories.length === 0 && <li className="px-5 py-6 text-sm text-gray-400">Departments unavailable</li>}
      </ul>
      <Link to="/categories" className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm font-semibold text-primary hover:bg-orange-50">
        <span>View all departments</span>
        <ArrowRight size={15} />
      </Link>
    </div>
  );
};

export default CategoryMenu;
