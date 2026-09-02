import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discount && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            -{product.discount}%
          </span>
        )}
        {product.isNew && (
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            New
          </span>
        )}
      </div>

      {/* Hover Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white shadow-sm transition-colors">
          <Heart size={16} />
        </button>
        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white shadow-sm transition-colors">
          <Eye size={16} />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden cursor-pointer">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out p-4"
        />
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">{product.category}</span>
        
        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 leading-snug cursor-pointer hover:text-primary transition-colors">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className={`w-3 h-3 ${star <= product.rating ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">৳{product.price.toLocaleString()}</span>
            </div>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">৳{product.oldPrice.toLocaleString()}</span>
            )}
          </div>
          
          <button className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors transform active:scale-95 group/cart">
            <ShoppingCart size={16} className="group-hover/cart:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
