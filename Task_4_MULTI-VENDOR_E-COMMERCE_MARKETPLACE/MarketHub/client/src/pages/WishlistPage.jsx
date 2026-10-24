import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export const WishlistPage = () => {
  const { items, removeFromWishlist, moveToCart } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleMoveToCart = async (productId, name) => {
    try {
      await moveToCart(productId);
      addToast(`Moved "${name}" to your cart!`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRemove = async (id) => {
    await removeFromWishlist(id);
    addToast('Item removed from wishlist');
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save your favorite products to your wishlist so you can easily purchase them later."
          actionLabel="Explore Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">
          {items.length} items saved for future shopping
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((it) => {
          const p = it.product;
          return (
            <div
              key={it.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                <div className="relative aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden mb-3 border border-slate-100">
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(it.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-600 shadow-xs"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] font-semibold text-indigo-600 mb-1">
                  {p.vendor?.businessName || 'Verified Seller'}
                </div>
                <Link to={`/products/${p.id}`} className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-indigo-600">
                  {p.name}
                </Link>
                <div className="mt-2 text-base font-extrabold text-slate-900">
                  {formatCurrency(p.price)}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleMoveToCart(p.id, p.name)}
                  icon={ShoppingBag}
                  className="w-full"
                >
                  Move to Cart
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
