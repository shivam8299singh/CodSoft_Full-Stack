import { Clock, Plus, Star } from 'lucide-react';
import React from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../common/Badge';

const FoodCard = ({ item, onSelect }) => {
  const { addToCart } = useCart();
  const toast = useToast();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    addToCart(item, 1);
    toast.success(`Added ${item.name} to cart!`);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(item)}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Dietary Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-white">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              item.isVegetarian ? 'bg-emerald-500' : 'bg-rose-600'
            }`}
          />
          <span className="text-[11px] font-bold text-slate-800">
            {item.isVegetarian ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{item.rating.toFixed(1)}</span>
        </div>

        {/* Unavailability overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-600">
              {item.category?.name || 'Chef Specialty'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              {item.prepTime || 20}m
            </span>
          </div>

          <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {item.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-xl font-extrabold text-slate-900 font-sans">
              ₹{item.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!item.isAvailable}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition shadow-md ${
              item.isAvailable
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
