import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    totalItems,
  } = useCart();

  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Explore our chef-curated selection of dishes, wood-fired pizzas, and beverages to start your culinary journey."
          actionText="Browse Menu"
          onAction={() => navigate('/menu')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
            Selected Gastronomy
          </span>
          <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
            Shopping Cart ({totalItems} items)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="divide-y divide-slate-100">
            {cart.map((item) => (
              <div
                key={item.id}
                className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 font-serif">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600 mt-0.5">
                      ₹{item.price.toFixed(2)} each
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 mt-1.5 inline-block">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-slate-500 hover:text-slate-900 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="text-slate-500 hover:text-slate-900 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-extrabold text-base text-slate-900 font-sans w-20 text-right">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link to="/menu" className="text-xs font-semibold text-amber-600 hover:underline">
              ← Add more items from menu
            </Link>
          </div>
        </div>

        {/* Order Summary Sticky Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 sticky top-28">
          <h3 className="text-lg font-bold font-serif text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (5%)</span>
              <span className="font-bold text-slate-900">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Delivery Charges</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Amount</span>
              <span className="text-amber-600 font-sans font-extrabold">
                ₹{(subtotal + tax).toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full py-4 text-sm shadow-xl shadow-amber-600/30"
            onClick={() => navigate('/checkout')}
            icon={ArrowRight}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
