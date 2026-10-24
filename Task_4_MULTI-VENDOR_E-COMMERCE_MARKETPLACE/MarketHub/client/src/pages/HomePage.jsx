import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes, dealRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8&sort=popular'),
          api.get('/products?onSale=true&limit=4'),
        ]);

        if (catRes.data?.success) setCategories(catRes.data.data);
        if (prodRes.data?.success) setFeaturedProducts(prodRes.data.data);
        if (dealRes.data?.success) setDealProducts(dealRes.data.data);
      } catch (err) {
        console.error('Home data load failed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Loading MarketHub marketplace..." />;

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white py-16 sm:py-24">
        {/* Abstract decorative ambient blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Next-Generation Multi-Vendor Commerce</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Shop Thousands of Products from <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-orange-400">Certified Multi-Vendors</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                One unified cart. Multi-vendor checkout. Real-time order fulfillment tracking and automated sandbox payments.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40 hover:shadow-indigo-500/50 transition-all flex items-center gap-2 group"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/register?role=VENDOR"
                  className="px-6 py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Become a Seller</span>
                </Link>
              </div>

              {/* Mini trust stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
                <div>
                  <span className="text-2xl font-black text-white">50+</span>
                  <p className="text-xs text-slate-400">Curated Products</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-white">5+</span>
                  <p className="text-xs text-slate-400">Verified Vendors</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-white">100%</span>
                  <p className="text-xs text-slate-400">Sandbox Protected</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card Showcase */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-tr from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Multi-Vendor Store</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {dealProducts.slice(0, 2).map((p) => (
                    <div key={p.id} className="bg-slate-800/90 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                        alt={p.name}
                        className="w-full aspect-square object-cover rounded-xl mb-2"
                      />
                      <span className="text-xs font-bold text-white truncate">{p.name}</span>
                      <span className="text-xs font-extrabold text-amber-400">₹{p.price}</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Callout Card */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Limited Welcome Deal</span>
                    <p className="text-sm font-bold text-white">Use code: <span className="text-amber-400 font-mono">MARKET10</span></p>
                  </div>
                  <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full">
                    10% OFF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse by Category</h2>
            <p className="text-sm text-slate-500">Explore authentic merchandise across high-demand departments</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-slate-100 border border-slate-100 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {cat._count?.products || 0} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Deals Section */}
      {dealProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs mb-2">
                  <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Limited Time Flash Offers</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">Today's Hottest Deals</h2>
                <p className="text-sm text-white/80">Save up to 30% on verified multi-vendor products</p>
              </div>

              <Link
                to="/products?onSale=true"
                className="self-start md:self-auto px-5 py-2.5 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all text-xs"
              >
                View All Deals
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Marketplace Products</h2>
            <p className="text-sm text-slate-500">Handpicked items curated by verified vendor ratings</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            <span>Browse All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. Marketplace Multi-Vendor Perks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Why Customers Love MarketHub
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Built with an enterprise architecture ensuring complete transparency and trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Vendor Flexibility</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add products from multiple independent vendors in a single session. Our smart checkout handles sub-order dispatch seamlessly.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Certified Quality Control</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every vendor is thoroughly reviewed and approved by marketplace administrators before listing products for sale.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">End-to-End Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Assigned delivery partners update order milestones in real time from confirmation to doorstep handover.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
