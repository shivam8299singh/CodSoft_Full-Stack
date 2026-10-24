import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const p = item.product;
  const imageUrl = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
  const maxStock = p.inventory?.availableStock || 99;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 gap-4 transition-all hover:border-slate-300">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0">
        <Link to={`/products/${p.id}`} className="shrink-0">
          <img
            src={imageUrl}
            alt={p.name}
            className="w-20 h-20 object-cover rounded-xl border border-slate-100"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-indigo-600 font-semibold mb-0.5">
            Vendor: {p.vendor?.businessName || 'Verified Seller'}
          </div>
          <Link to={`/products/${p.id}`} className="block">
            <h4 className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
              {p.name}
            </h4>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-extrabold text-slate-900">
              {formatCurrency(item.discountedUnitPrice || p.price)}
            </span>
            {p.discount > 0 && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(p.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity & Total Section */}
      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Controller */}
        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 p-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={item.quantity <= 1}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-800">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={item.quantity >= maxStock}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[90px]">
          <span className="text-base font-extrabold text-slate-900">
            {formatCurrency(item.itemTotal || (item.discountedUnitPrice || p.price) * item.quantity)}
          </span>
        </div>

        {/* Delete */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
