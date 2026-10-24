import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  DollarSign,
  Star,
  Store,
  AlertCircle
} from 'lucide-react';

export const VendorLayout = () => {
  const { user, isVendor, loading } = useAuth();

  if (loading) return null;
  if (!user || !isVendor) {
    return <Navigate to="/login" replace />;
  }

  const vendor = user.vendor;
  const isApproved = vendor?.status === 'APPROVED';

  const vendorLinks = [
    { to: '/vendor/dashboard', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vendor/products', label: 'Products', icon: Package },
    { to: '/vendor/inventory', label: 'Inventory', icon: Layers },
    { to: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/vendor/promotions', label: 'Promotions', icon: Tag },
    { to: '/vendor/financials', label: 'Financials & Payouts', icon: DollarSign },
    { to: '/vendor/reviews', label: 'Customer Reviews', icon: Star },
    { to: '/vendor/profile', label: 'Store Profile', icon: Store },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar title="Vendor Portal" links={vendorLinks} backLink="/" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              {vendor?.businessName || 'Vendor Portal'}
            </h1>
            <p className="text-xs text-slate-500">
              Commission Rate: {vendor?.commissionRate || 10}% • Multi-Vendor Partner
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isApproved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {vendor?.status || 'PENDING'}
            </span>
          </div>
        </header>

        {/* Warning if not approved */}
        {!isApproved && (
          <div className="mx-8 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              Your vendor application is currently <strong>{vendor?.status}</strong>. Product listings and order fulfillment will become active once verified by the marketplace administrator.
            </p>
          </div>
        )}

        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default VendorLayout;
