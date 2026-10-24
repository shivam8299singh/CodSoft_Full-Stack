import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Users,
  FolderTree,
  Package,
  ShoppingBag,
  Percent,
  BarChart3
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const adminLinks = [
    { to: '/admin/dashboard', end: true, label: 'Platform Overview', icon: LayoutDashboard },
    { to: '/admin/vendors', label: 'Vendors & Approvals', icon: Store },
    { to: '/admin/users', label: 'Users Management', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/products', label: 'All Products', icon: Package },
    { to: '/admin/orders', label: 'Marketplace Orders', icon: ShoppingBag },
    { to: '/admin/commissions', label: 'Commissions & Payouts', icon: Percent },
    { to: '/admin/analytics', label: 'Marketplace Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar title="Admin Control" links={adminLinks} backLink="/" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              MarketHub Administrator Center
            </h1>
            <p className="text-xs text-slate-500">
              Superadmin Control • Multi-Vendor Governance & Revenue Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              System Admin
            </span>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
