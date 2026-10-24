import React from 'react';
import { Star, RotateCcw, Check } from 'lucide-react';
import Button from './Button';

export const FilterPanel = ({
  categories = [],
  vendors = [],
  filters = {},
  onChange,
  onReset,
  className = '',
}) => {
  const ratings = [4, 3, 2];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-base">Filter Catalog</h3>
        <button
          onClick={onReset}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categories</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onChange({ category: '' })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filters.category ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ category: c.slug })}
              className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.category === c.slug
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{c.name}</span>
              {c._count?.products !== undefined && (
                <span className="text-[10px] text-slate-400">({c._count.products})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400">Min</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => onChange({ minPrice: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400">Max</label>
            <input
              type="number"
              placeholder="100000"
              value={filters.maxPrice || ''}
              onChange={(e) => onChange({ maxPrice: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Minimum Rating</h4>
        <div className="space-y-1.5">
          {ratings.map((r) => (
            <button
              key={r}
              onClick={() => onChange({ minRating: filters.minRating === String(r) ? '' : String(r) })}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.minRating === String(r)
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < r ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span>& above</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => onChange({ inStock: e.target.checked ? 'true' : '' })}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-700 font-medium">In Stock Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.onSale === 'true'}
            onChange={(e) => onChange({ onSale: e.target.checked ? 'true' : '' })}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-700 font-medium">On Sale / Discounted</span>
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
