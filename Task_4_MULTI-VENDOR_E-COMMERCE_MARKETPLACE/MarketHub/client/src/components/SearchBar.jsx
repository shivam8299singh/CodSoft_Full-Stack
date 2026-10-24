import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const SearchBar = ({ className = '', placeholder = 'Search 10,000+ products, brands & vendors...' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
        if (res.data?.success) {
          setSuggestions(res.data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProduct = (productId) => {
    setIsOpen(false);
    navigate(`/products/${productId}`);
  };

  const handleSelectCategory = (slug) => {
    setIsOpen(false);
    navigate(`/products?category=${slug}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => (suggestions.products.length > 0 || suggestions.categories.length > 0) && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm rounded-full pl-11 pr-20 py-2.5 transition-all outline-none border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
          <div className="absolute left-4 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>

          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 overflow-hidden divide-y divide-slate-100">
          {suggestions.categories.length > 0 && (
            <div className="px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCategory(c.slug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.products.length > 0 && (
            <div className="py-2">
              <div className="px-4 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matching Products</span>
              </div>
              {suggestions.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 text-left transition-colors"
                >
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-indigo-600">{formatCurrency(p.price)}</span>
                      {p.brand && <span className="text-[11px] text-slate-400">• {p.brand}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
