import React from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, LogOut, ChevronLeft, MapPin } from 'lucide-react';

export const DeliveryLayout = () => {
  const { user, isDelivery, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user || !isDelivery) {
    return <Navigate to="/login" replace />;
  }

  const partner = user.deliveryPartner;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Delivery App Top Header */}
      <header className="bg-slate-900 text-white px-4 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">{partner?.name || user.name}</h1>
              <div className="flex items-center gap-2 text-[11px] text-cyan-400">
                <span>{partner?.vehicleType || 'Motorcycle'}</span>
                {partner?.vehicleNumber && <span>• {partner.vehicleNumber}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;
