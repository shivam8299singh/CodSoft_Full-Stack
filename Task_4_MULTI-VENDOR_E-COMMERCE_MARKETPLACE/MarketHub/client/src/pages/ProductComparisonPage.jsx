import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Trash2, ShoppingBag, Star, Check, X, Store } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export const ProductComparisonPage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = async (p) => {
    try {
      await addToCart(p.id, 1);
      addToast(`Added "${p.name}" to cart!`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (!compareItems || compareItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ArrowLeftRight}
          title="No Products to Compare"
          description="Click the compare icon on product cards or detail pages to compare up to 4 items side by side."
          actionLabel="Browse Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  // Gather unique specification keys across all compared items
  const allSpecKeys = Array.from(
    new Set(
      compareItems.flatMap((p) => (p.specifications ? Object.keys(p.specifications) : []))
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Comparison</h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparing {compareItems.length} products side by side
          </p>
        </div>

        <button
          onClick={clearCompare}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Comparison</span>
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 divide-x divide-slate-100">
              <th className="p-4 w-48 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-400">
                Feature
              </th>
              {compareItems.map((p) => (
                <th key={p.id} className="p-4 min-w-[220px] max-w-[280px]">
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-600 hover:text-rose-600 shadow-xs"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Link to={`/products/${p.id}`} className="font-bold text-slate-900 line-clamp-2 hover:text-indigo-600">
                      {p.name}
                    </Link>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddToCart(p)}
                      icon={ShoppingBag}
                      className="w-full"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Price */}
            <tr className="divide-x divide-slate-100">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">Price</td>
              {compareItems.map((p) => (
                <td key={p.id} className="p-4">
                  <span className="text-base font-extrabold text-slate-900">{formatCurrency(p.price)}</span>
                  {p.discount > 0 && (
                    <span className="block text-[11px] text-emerald-600 font-bold">{p.discount}% Off</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Vendor */}
            <tr className="divide-x divide-slate-100">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">Seller / Vendor</td>
              {compareItems.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-indigo-600">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>{p.vendor?.businessName || 'Verified Partner'}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="divide-x divide-slate-100">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">Customer Rating</td>
              {compareItems.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-lg w-max font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{p.rating > 0 ? p.rating.toFixed(1) : '4.5'}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Availability */}
            <tr className="divide-x divide-slate-100">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40">Stock Status</td>
              {compareItems.map((p) => (
                <td key={p.id} className="p-4 font-medium">
                  {p.inventory?.availableStock > 0 ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Stock ({p.inventory.availableStock})
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">Out of Stock</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Specifications rows */}
            {allSpecKeys.map((key) => (
              <tr key={key} className="divide-x divide-slate-100">
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">{key}</td>
                {compareItems.map((p) => (
                  <td key={p.id} className="p-4 text-slate-800">
                    {p.specifications?.[key] ? String(p.specifications[key]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductComparisonPage;
