import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Tag, Store, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import CartItem from '../components/CartItem';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, applyPromo, removePromo, appliedPromo } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    try {
      setApplyingPromo(true);
      const res = await applyPromo(promoInput.trim());
      addToast(`Coupon "${promoInput.toUpperCase()}" applied successfully!`);
      setPromoInput('');
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setApplyingPromo(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          description="Browse thousands of products from certified multi-vendors and add items to your cart."
          actionLabel="Start Shopping"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Clear Cart Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {cart.summary.itemCount} items from {cart.vendorGroups?.length || 1} independent sellers
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Items grouped by Vendor */}
        <div className="lg:col-span-2 space-y-6">
          {cart.vendorGroups?.map((group) => (
            <div
              key={group.vendorId}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
            >
              {/* Vendor Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{group.businessName}</h3>
                    <span className="text-[10px] text-slate-400">Certified Vendor Sub-Order</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  Subtotal: {formatCurrency(group.vendorSubtotal)}
                </span>
              </div>

              {/* Items belonging to this vendor */}
              <div className="space-y-3">
                {group.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Order Summary & Coupon */}
        <div className="lg:col-span-1 space-y-6">
          {/* Coupon Code Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span>Apply Marketplace Coupon</span>
            </div>

            {appliedPromo ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800 uppercase block">{appliedPromo.code}</span>
                  <span className="text-emerald-600 text-[11px]">Saved {formatCurrency(appliedPromo.discountAmount)}</span>
                </div>
                <button
                  onClick={removePromo}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MARKET10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="flex-1 text-xs rounded-xl border border-slate-200 px-3 py-2 uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
                <Button type="submit" variant="primary" size="sm" loading={applyingPromo}>
                  Apply
                </Button>
              </form>
            )}

            <div className="text-[11px] text-slate-400">
              Try demo promo code: <strong className="text-indigo-600 font-mono">MARKET10</strong> (10% off) or <strong className="text-indigo-600 font-mono">WELCOME500</strong>
            </div>
          </div>

          {/* Order Totals Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Order Summary</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.summary.itemCount} items)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(cart.summary.subtotal)}</span>
              </div>

              {cart.summary.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Total Savings / Discounts</span>
                  <span>-{formatCurrency(cart.summary.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (5%)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(cart.summary.tax)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-800">
                  {cart.summary.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[11px]">FREE</span>
                  ) : (
                    formatCurrency(cart.summary.shippingFee)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-slate-900 text-base font-black">
                <span>Grand Total</span>
                <span className="text-indigo-600">{formatCurrency(cart.summary.grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              icon={ArrowRight}
              className="w-full mt-4"
            >
              Proceed to Checkout
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Multi-Vendor Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
