import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import React from 'react';

const FoodFilter = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isVegOnly,
  onToggleVeg,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="space-y-6 mb-10">
      {/* Search and Secondary Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dishes, ingredients, pizzas, desserts..."
            className="w-full bg-white rounded-2xl pl-12 pr-10 py-3.5 text-sm text-slate-900 border border-slate-200/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary and Sort Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Veg Only Toggle */}
          <button
            onClick={onToggleVeg}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl text-xs font-bold border transition shrink-0 ${
              isVegOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isVegOnly ? 'bg-white' : 'bg-emerald-500'
              }`}
            />
            Veg Only
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-white rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0 cursor-pointer"
          >
            <option value="newest">Featured & Newest</option>
            <option value="rating">Top Rated ⭐</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug || selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FoodFilter;
