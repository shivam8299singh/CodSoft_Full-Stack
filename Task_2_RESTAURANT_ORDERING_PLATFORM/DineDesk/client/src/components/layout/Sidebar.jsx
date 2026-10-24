import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  Grid,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders Queue', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Menu Catalog', path: '/admin/menu', icon: BookOpen },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Floor Tables', path: '/admin/tables', icon: Grid },
    { label: 'Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Staff & Team', path: '/admin/staff', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const staffNav = [
    { label: 'Floor Overview', path: '/staff', icon: LayoutDashboard },
    { label: 'Orders Feed', path: '/staff/orders', icon: ShoppingBag },
    { label: 'Reservations', path: '/staff/reservations', icon: CalendarCheck },
    { label: 'Table Status', path: '/staff/tables', icon: Grid },
    { label: 'Customers', path: '/staff/customers', icon: Users },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNav : staffNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/30">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold font-serif text-white tracking-tight">
              Dine<span className="text-amber-500">Desk</span>
            </span>
            <span className="block text-[10px] tracking-widest uppercase font-semibold text-amber-500">
              {user?.role === 'ADMIN' ? 'Control Panel' : 'Staff Operations'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-lg shadow-amber-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
