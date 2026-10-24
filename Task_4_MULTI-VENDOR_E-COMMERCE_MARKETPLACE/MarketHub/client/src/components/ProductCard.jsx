import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ArrowLeftRight, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { addToast } = useToast();

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

  const discountPercent = product.discount || 0;
  const discountedPrice = discountPercent > 0 ? product.price * (1 - discountPercent / 100) : product.price;
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.inventory?.availableStock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      addToast(`Added "${product.name}" to cart!`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await toggleWishlist(product.id);
      addToast(res?.message || 'Wishlist updated');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = addToCompare(product);
    if (added) {
      addToast(`Added "${product.name}" to comparison!`);
    } else {
      addToast(`Removed from comparison.`);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-600 text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-white">
              Out of Stock
            </span>
          ) : product.inventory?.availableStock <= 5 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white">
              Only {product.inventory?.availableStock} left
            </span>
          ) : null}
        </div>

        {/* Quick action buttons on top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 ${
              inWishlist
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={handleCompare}
            aria-label="Compare"
            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 ${
              inCompare
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-white/90 text-slate-600 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* Vendor & Category line */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium text-indigo-600 truncate max-w-[140px]">
            {product.vendor?.businessName || 'Verified Vendor'}
          </span>
          {product.category?.name && (
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/products/${product.id}`} className="block group-hover:text-indigo-600 transition-colors">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating > 0 ? product.rating.toFixed(1) : '4.5'}</span>
          </div>
          <span className="text-xs text-slate-400">({product.numReviews || 12})</span>
        </div>

        {/* Price & Add to Cart button pinned to bottom */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(discountedPrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 hover:shadow-indigo-300 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
