import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Bell,
  ArrowLeftRight,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useNotifications } from '../context/NotificationContext';
import SearchBar from './SearchBar';

export const Navbar = () => {
  const { user, logout, isCustomer, isVendor, isAdmin, isDelivery, login } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'All Products', path: '/products' },
    { label: 'Categories', path: '/products' },
    { label: 'Flash Deals', path: '/products?onSale=true', badge: 'HOT' },
  ];

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner for quick role demo & announcements */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
              Task 4 Demo
            </span>
            <span>MarketHub Multi-Vendor Marketplace — High-Performance E-Commerce</span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">Quick Demo Login:</span>
            <button
              onClick={() => handleQuickLogin('customer@markethub.com', 'Customer@123')}
              className="text-indigo-400 hover:text-white transition-colors underline"
            >
              Customer
            </button>
            <span>•</span>
            <button
              onClick={() => handleQuickLogin('vendor@markethub.com', 'Vendor@123')}
              className="text-amber-400 hover:text-white transition-colors underline"
            >
              Vendor
            </button>
            <span>•</span>
            <button
              onClick={() => handleQuickLogin('delivery@markethub.com', 'Delivery@123')}
              className="text-cyan-400 hover:text-white transition-colors underline"
            >
              Delivery Partner
            </button>
            <span>•</span>
            <button
              onClick={() => handleQuickLogin('admin@markethub.com', 'Admin@123')}
              className="text-rose-400 hover:text-white transition-colors underline"
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 lg:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Market<span className="text-indigo-600">Hub</span>
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-1">
                Multi-Vendor
              </span>
            </div>
          </Link>

          {/* Search Bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Compare Badge */}
            <Link
              to="/compare"
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex items-center justify-center"
              title="Compare Products"
            >
              <ArrowLeftRight className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Wishlist Badge */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex items-center justify-center"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-center"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown (If logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</span>
                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-indigo-50/50' : ''
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth Area */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                >
                  <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate hidden md:block">
                    {user.name}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-600">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1 text-xs text-slate-700">
                      {/* Role Specific Quick Portals */}
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-semibold text-rose-600"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      {isVendor && (
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-semibold text-amber-600"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Vendor Dashboard
                        </Link>
                      )}

                      {isDelivery && (
                        <Link
                          to="/delivery/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-semibold text-cyan-600"
                        >
                          <Truck className="w-4 h-4" />
                          Delivery Hub
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        Order History
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        Wishlist
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Row on Desktop */}
        <div className="hidden md:flex items-center justify-between py-2 border-t border-slate-100 text-xs">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`font-semibold transition-colors flex items-center gap-1.5 ${
                  location.pathname === link.path
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Free shipping on orders above ₹1,000
            </span>
            <span>•</span>
            <Link to="/register?role=VENDOR" className="text-indigo-600 hover:underline font-bold">
              Become a Seller
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4">
          <SearchBar />

          <nav className="space-y-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Compare Products ({compareCount})
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              My Wishlist ({wishlistCount})
            </Link>
          </nav>

          {/* Quick Demo Logins for mobile */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Role Switch:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin('customer@markethub.com', 'Customer@123')}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-center"
              >
                Customer Demo
              </button>
              <button
                onClick={() => handleQuickLogin('vendor@markethub.com', 'Vendor@123')}
                className="p-2 rounded-lg bg-amber-50 text-amber-700 font-semibold text-center"
              >
                Vendor Demo
              </button>
              <button
                onClick={() => handleQuickLogin('delivery@markethub.com', 'Delivery@123')}
                className="p-2 rounded-lg bg-cyan-50 text-cyan-700 font-semibold text-center"
              >
                Delivery Demo
              </button>
              <button
                onClick={() => handleQuickLogin('admin@markethub.com', 'Admin@123')}
                className="p-2 rounded-lg bg-rose-50 text-rose-700 font-semibold text-center"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
