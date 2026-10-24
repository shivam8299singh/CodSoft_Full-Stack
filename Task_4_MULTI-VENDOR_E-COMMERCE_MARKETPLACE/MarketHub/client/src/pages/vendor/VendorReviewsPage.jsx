import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Package } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const VendorReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vendor/reviews');
        if (res.data?.success) {
          setReviews(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <LoadingSpinner text="Loading customer reviews..." />;

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-200/80">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Reviews on Your Products</h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor feedback and sentiment from buyers to maintain top-tier store reputation
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Reviews Yet"
          description="Customer reviews for your store's products will appear here once verified buyers share feedback."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={r.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={r.product?.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-100"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{r.product?.name}</h4>
                    <span className="text-[10px] text-slate-400">By {r.user?.name} • {formatDate(r.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl leading-relaxed">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviewsPage;
