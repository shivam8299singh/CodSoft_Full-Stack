import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ title, links = [], backLink = '/' }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">MarketHub</span>
            <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              {title}
            </span>
          </div>
        </Link>
      </div>

      {/* User Mini Bar */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span>{link.label}</span>
              {link.badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Return & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          to={backLink}
          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Customer Storefront</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
