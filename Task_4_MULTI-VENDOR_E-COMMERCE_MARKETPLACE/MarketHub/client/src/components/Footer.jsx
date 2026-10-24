import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      {/* Value Proposition Banners */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Delivery</h4>
              <p className="text-xs text-slate-500">Tracked shipping by verified partners</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Sandbox Pay</h4>
              <p className="text-xs text-slate-500">COD, UPI & simulated cards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Returns</h4>
              <p className="text-xs text-slate-500">Hassle-free return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">24/7 Support</h4>
              <p className="text-xs text-slate-500">Dedicated assistance for shoppers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Market<span className="text-indigo-400">Hub</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            MarketHub is an enterprise-grade multi-vendor marketplace connecting customers, certified sellers, delivery partners, and marketplace operators in one unified platform.
          </p>
          <div className="pt-2 text-xs text-slate-500">
            CodSoft Internship Project • Task 4 Multi-Vendor E-Commerce
          </div>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products" className="hover:text-white transition-colors">Browse Catalog</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
            <li><Link to="/compare" className="hover:text-white transition-colors">Product Comparison</Link></li>
          </ul>
        </div>

        {/* Multi-Vendor Partners */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seller Center</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/register?role=VENDOR" className="hover:text-white transition-colors font-semibold text-indigo-400">Become a Vendor</Link></li>
            <li><Link to="/vendor/dashboard" className="hover:text-white transition-colors">Vendor Dashboard</Link></li>
            <li><Link to="/register?role=DELIVERY_PARTNER" className="hover:text-white transition-colors">Delivery Partner Signup</Link></li>
            <li><Link to="/delivery/dashboard" className="hover:text-white transition-colors">Delivery Dashboard</Link></li>
            <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Marketplace Admin</Link></li>
          </ul>
        </div>

        {/* Legal & Tech */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform Specs</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>React + Vite Frontend</li>
            <li>Node.js + Express REST API</li>
            <li>PostgreSQL + Prisma ORM</li>
            <li>Multi-Vendor Sub-Orders</li>
            <li>Marketplace Commissions</li>
          </ul>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} MarketHub Inc. All rights reserved. Crafted for CodSoft Full-Stack Internship.
      </div>
    </footer>
  );
};

export default Footer;
