import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  ArrowLeftRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Store,
  Check,
  Plus,
  Minus,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState({ reviews: [], total: 0, averageRating: 0, distribution: {} });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`).catch(() => ({ data: { success: false } })),
        ]);

        if (prodRes.data?.success) {
          const p = prodRes.data.data;
          setProduct(p);
          const primary = p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url;
          setSelectedImage(primary);
        }

        if (revRes.data?.success) {
          setReviewsData(revRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen text="Loading product details..." />;
  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const discountPercent = product.discount || 0;
  const discountedPrice = discountPercent > 0 ? product.price * (1 - discountPercent / 100) : product.price;
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const availableStock = product.inventory?.availableStock || 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      addToast(`Added ${quantity} × "${product.name}" to cart!`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to leave a review.', 'error');
      navigate('/login');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await api.post(`/products/${product.id}/reviews`, reviewForm);
      if (res.data?.success) {
        addToast('Review submitted successfully!');
        setReviewForm({ rating: 5, comment: '' });
        // Refresh reviews
        const revRes = await api.get(`/products/${id}/reviews`);
        if (revRes.data?.success) setReviewsData(revRes.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 flex items-center gap-2">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-slate-700">Catalog</Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-slate-100 overflow-hidden border border-slate-200/80 shadow-xs">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.url ? 'border-indigo-600 scale-95 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions & Specs */}
        <div className="space-y-6">
          {/* Vendor Card Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Store className="w-4 h-4" />
            <span>Sold by: {product.vendor?.businessName || 'Verified Seller'}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-xs text-slate-400 font-semibold mt-1">Brand: {product.brand} • SKU: {product.sku}</p>
            )}
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : '4.5'}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Based on {reviewsData.total || product.numReviews || 12} customer reviews
            </span>
          </div>

          {/* Pricing Row */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {formatCurrency(discountedPrice)}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-base text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  Save {formatCurrency(product.price - discountedPrice)}
                </span>
              </>
            )}
          </div>

          {/* Stock availability banner */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isOutOfStock ? (
              <span className="text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Currently Out of Stock
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                In Stock ({availableStock} units available)
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity selector and Cart buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                icon={ShoppingBag}
                className="flex-1"
              >
                Add to Cart
              </Button>

              <Button
                variant="accent"
                size="lg"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1"
              >
                Buy Now
              </Button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  inWishlist
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-600' : ''}`} />
              </button>

              {/* Compare toggle */}
              <button
                onClick={() => addToCompare(product)}
                className={`p-3.5 rounded-xl border transition-all ${
                  inCompare
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Compare side by side"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-2.5 text-slate-700">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Est. Delivery: 2-3 Days</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-2.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Certified Vendor</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-2.5 text-slate-700">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>7-Day Hassle Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-semibold text-slate-500">{key}</span>
                <span className="font-bold text-slate-800 text-right">{String(val)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Submit Form */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-slate-500">Verified buyer feedback on this product</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
            {reviewsData.total} Reviews
          </span>
        </div>

        {/* Submit review box */}
        <form onSubmit={handleSubmitReview} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Write a Customer Review</h4>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rating (1 to 5 Stars):</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your Review:</label>
            <textarea
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share details about product quality, fit, performance, and seller fulfillment..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              required
            />
          </div>

          <Button type="submit" variant="primary" size="md" loading={submittingReview}>
            Submit Review
          </Button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsData.reviews?.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No customer reviews yet. Be the first to review!</p>
          ) : (
            reviewsData.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {rev.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{rev.user?.name}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-10">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Related Products in this Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
