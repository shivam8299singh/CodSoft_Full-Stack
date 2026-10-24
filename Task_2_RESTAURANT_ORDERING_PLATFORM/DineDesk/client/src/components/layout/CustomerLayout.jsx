import {
  CalendarCheck,
  LayoutDashboard,
  ShoppingBag,
  User,
} from 'lucide-react';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from './Footer';
import Navbar from './Navbar';

const CustomerLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const customerTabs = [
    { label: 'Overview', path: '/customer', icon: LayoutDashboard },
    { label: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
    { label: 'My Reservations', path: '/customer/reservations', icon: CalendarCheck },
    { label: 'Profile Settings', path: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Customer Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                Customer Account
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif mt-1">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Manage your orders, table bookings, and dining preferences.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/menu"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold shadow-md transition"
              >
                Order Food
              </Link>
              <Link
                to="/reservations"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold border border-white/20 transition"
              >
                Book Table
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          {customerTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-amber-600 text-amber-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Child Pages */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;
