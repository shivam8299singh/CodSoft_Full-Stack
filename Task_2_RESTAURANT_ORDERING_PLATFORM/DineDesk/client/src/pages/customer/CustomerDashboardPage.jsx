import {
  CalendarCheck,
  CreditCard,
  Eye,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { dashboardService } from '../../services/dashboardService';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const CustomerDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspectOrder, setInspectOrder] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getCustomerDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load customer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching your dining overview..." />;
  }

  const { stats, activeOrders = [], recentOrders = [], reservations = [] } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">
              {stats?.totalOrders || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Orders
            </span>
            <h3 className="text-2xl font-bold font-serif text-amber-600 mt-1">
              {stats?.activeOrdersCount || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Spent
            </span>
            <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">
              ₹{(stats?.totalSpent || 0).toFixed(2)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reservations
            </span>
            <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">
              {stats?.totalReservations || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Live Orders Tracker */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            Active Orders In Preparation
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {activeOrders.map((order) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                label: order.status,
                color: 'bg-slate-100 text-slate-800',
              };

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900 font-serif">
                          {order.orderNumber}
                        </h3>
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.orderType.replace('_', ' ')} • Placed{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/track/${order.orderNumber}`}>
                        <Button variant="outline" size="sm">
                          Live Tracker
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => setInspectOrder(order)}
                        icon={Eye}
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>

                  <OrderTimeline currentStatus={order.status} orderType={order.orderType} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders and Reservations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold font-serif text-slate-900">Recent Orders</h3>
            <Link
              to="/customer/orders"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => {
                const statusInfo = ORDER_STATUS_LABELS[ord.status] || {
                  label: ord.status,
                  color: 'bg-slate-100 text-slate-800',
                };
                return (
                  <div
                    key={ord.id}
                    className="py-3.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{ord.orderNumber}</p>
                      <p className="text-slate-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString()} • {ord.items?.length || 0} items
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800 font-sans">
                        ₹{ord.totalAmount?.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                      <button
                        onClick={() => setInspectOrder(ord)}
                        className="p-1 text-slate-400 hover:text-amber-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Table Reservations */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold font-serif text-slate-900">Upcoming Tables</h3>
            <Link
              to="/customer/reservations"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Manage
            </Link>
          </div>

          {reservations.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-slate-400 mb-4">No reservations booked.</p>
              <Link to="/reservations">
                <Button size="sm">Book a Table</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((resv) => (
                <div
                  key={resv.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>
                      {new Date(resv.reservationDate).toLocaleDateString()} at {resv.reservationTime}
                    </span>
                    <span className="text-amber-600 uppercase text-[10px]">{resv.status}</span>
                  </div>
                  <p className="text-slate-500">
                    {resv.guestsCount} Guests{' '}
                    {resv.table && `• Table #${resv.table.tableNumber} (${resv.table.location})`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inspect Order Modal */}
      {inspectOrder && (
        <OrderDetailModal
          order={inspectOrder}
          isOpen={Boolean(inspectOrder)}
          onClose={() => setInspectOrder(null)}
        />
      )}
    </div>
  );
};

export default CustomerDashboardPage;
