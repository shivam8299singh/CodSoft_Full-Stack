import { Clock, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

const ADDON_OPTIONS = [
  { label: 'Extra Cheese', price: 50 },
  { label: 'Extra Spicy', price: 0 },
  { label: 'No Onion', price: 0 },
  { label: 'No Garlic', price: 0 },
  { label: 'Gluten-Free Prep', price: 40 },
];

const FoodDetailModal = ({ item, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isOpen || !item) return null;

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.includes(addon.label)
        ? prev.filter((a) => a !== addon.label)
        : [...prev, addon.label]
    );
  };

  const calculateAddonsCost = () => {
    return selectedAddons.reduce((sum, label) => {
      const opt = ADDON_OPTIONS.find((o) => o.label === label);
      return sum + (opt ? opt.price : 0);
    }, 0);
  };

  const unitPrice = item.price + calculateAddonsCost();
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const combinedInstructions = [
      selectedAddons.join(', '),
      specialInstructions.trim(),
    ]
      .filter(Boolean)
      .join(' | ');

    addToCart(item, quantity, combinedInstructions);
    toast.success(`Added ${quantity}x ${item.name} to cart!`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 my-8 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Food Image */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                  {item.category?.name || 'Chef Specialty'}
                </span>
                <span className="text-white/60">•</span>
                <span className="flex items-center gap-1 text-xs text-white/80">
                  <Clock className="w-3.5 h-3.5" />
                  {item.prepTime || 20} min prep
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                {item.name}
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-1 rounded-xl font-bold text-sm shadow-md">
              <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
          </div>

          {/* Ingredients */}
          {item.ingredients && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Key Ingredients
              </h4>
              <p className="text-slate-700 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                {item.ingredients}
              </p>
            </div>
          )}

          {/* Add-ons & Customizations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Customizations & Preferences
            </h4>
            <div className="flex flex-wrap gap-2">
              {ADDON_OPTIONS.map((addon) => {
                const isSelected = selectedAddons.includes(addon.label);
                return (
                  <button
                    key={addon.label}
                    type="button"
                    onClick={() => toggleAddon(addon)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {addon.label} {addon.price > 0 && `(+₹${addon.price})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Special Kitchen Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less oil, dressing on the side, extra napkins"
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-slate-900 text-sm">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className="w-full sm:w-auto flex-1 text-sm py-3.5"
            icon={ShoppingBag}
          >
            Add to Order • ₹{totalPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;
