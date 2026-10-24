import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  LogOut,
  PackageCheck,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dashboardService } from '../../services/dashboardService';
import { orderService } from '../../services/orderService';

const KitchenDashboardPage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [kitchenData, setKitchenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchKitchenOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await dashboardService.getKitchenDashboard();
      setKitchenData(data);
    } catch (err) {
      console.error('Failed to load kitchen dashboard:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial load and periodic polling every 10s
  useEffect(() => {
    fetchKitchenOrders(true);
    const pollInterval = setInterval(() => {
      fetchKitchenOrders(false);
    }, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      await fetchKitchenOrders(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getElapsedTime = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    return `${diffMins} min ago`;
  };

  const { newOrders = [], preparingOrders = [], readyOrders = [] } = kitchenData || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* High-visibility Kitchen Header */}
      <header className="h-20 bg-slate-900 border-b border-slate-800 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-serif text-white tracking-tight">
                Kitchen Display System (KDS)
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {kitchenData?.totalActive || 0} Active Tickets
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chef Station • Auto-syncing live queue
            </p>
          </div>
        </div>

        {/* Live Clock & Chef Profile Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 font-mono text-sm font-bold text-amber-400">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchKitchenOrders(false)}
            icon={RefreshCw}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            Refresh
          </Button>

          <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
            Exit KDS
          </Link>
        </div>
      </header>

      {/* Main Kanban Content */}
      <main className="flex-1 p-6 sm:p-10 max-w-[1600px] w-full mx-auto">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Connecting to kitchen order queue..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: New / Placed Tickets */}
            <div className="flex flex-col rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    New Incoming Orders
                  </h2>
                </div>
                <span className="w-6 h-6 rounded-full bg-blue-900/60 text-blue-300 text-xs font-bold flex items-center justify-center">
                  {newOrders.length}
                </span>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
                {newOrders.length === 0 ? (
                  <p className="text-xs text-slate-600 py-10 text-center">No new orders waiting.</p>
                ) : (
                  newOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white font-mono">
                              {order.orderNumber}
                            </h3>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {order.orderType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.customerName} {order.table && `• Table #${order.table.tableNumber}`}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-800/50">
                          {getElapsedTime(order.createdAt)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-700/60 text-xs">
                        {order.items?.map((it) => (
                          <div key={it.id} className="py-2 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-sm">
                                {it.quantity}x {it.name}
                              </span>
                            </div>
                            {it.specialInstructions && (
                              <p className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-900/50 mt-1 font-mono">
                                ⚠ {it.specialInstructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {order.instructions && (
                        <p className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2 rounded-xl">
                          Note: {order.instructions}
                        </p>
                      )}

                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        isLoading={updatingId === order.id}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3"
                        icon={Flame}
                      >
                        Start Preparing
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: In Preparation */}
            <div className="flex flex-col rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Currently Preparing
                  </h2>
                </div>
                <span className="w-6 h-6 rounded-full bg-amber-900/60 text-amber-300 text-xs font-bold flex items-center justify-center">
                  {preparingOrders.length}
                </span>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
                {preparingOrders.length === 0 ? (
                  <p className="text-xs text-slate-600 py-10 text-center">No orders in preparation.</p>
                ) : (
                  preparingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-800/90 rounded-2xl p-5 border border-amber-500/40 shadow-md space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white font-mono">
                              {order.orderNumber}
                            </h3>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {order.orderType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.customerName} {order.table && `• Table #${order.table.tableNumber}`}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-800/50">
                          {getElapsedTime(order.createdAt)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-700/60 text-xs">
                        {order.items?.map((it) => (
                          <div key={it.id} className="py-2 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-sm">
                                {it.quantity}x {it.name}
                              </span>
                            </div>
                            {it.specialInstructions && (
                              <p className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-900/50 mt-1 font-mono">
                                ⚠ {it.specialInstructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        isLoading={updatingId === order.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3"
                        icon={CheckCircle2}
                      >
                        Mark Order Ready
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Ready for Pickup / Delivery */}
            <div className="flex flex-col rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Ready for Service
                  </h2>
                </div>
                <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-bold flex items-center justify-center">
                  {readyOrders.length}
                </span>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
                {readyOrders.length === 0 ? (
                  <p className="text-xs text-slate-600 py-10 text-center">No orders waiting for pickup.</p>
                ) : (
                  readyOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-800/90 rounded-2xl p-5 border border-emerald-500/40 shadow-md space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white font-mono">
                              {order.orderNumber}
                            </h3>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {order.orderType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.customerName} {order.table && `• Table #${order.table.tableNumber}`}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          Ready for Hand-off
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleUpdateStatus(
                            order.id,
                            order.orderType === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'DELIVERED'
                          )
                        }
                        isLoading={updatingId === order.id}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3"
                        icon={PackageCheck}
                      >
                        {order.orderType === 'DELIVERY'
                          ? 'Dispatch Delivery'
                          : 'Served / Picked Up'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenDashboardPage;
