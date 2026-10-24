import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Eye,
  Grid,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import TableCard from '../../components/tables/TableCard';
import { useToast } from '../../context/ToastContext';
import { dashboardService } from '../../services/dashboardService';
import { orderService } from '../../services/orderService';
import { reservationService } from '../../services/reservationService';
import { tableService } from '../../services/tableService';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const StaffDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspectOrder, setInspectOrder] = useState(null);
  const toast = useToast();

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getStaffDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleTableStatusChange = async (tableId, newStatus) => {
    try {
      await tableService.updateTableStatus(tableId, newStatus);
      toast.success(`Table status changed to ${newStatus}`);
      fetchStaffData();
    } catch (err) {
      toast.error(err.message || 'Failed to update table status');
    }
  };

  const handleReservationStatusChange = async (resvId, newStatus) => {
    try {
      await reservationService.updateReservationStatus(resvId, newStatus);
      toast.success(`Reservation updated to ${newStatus}`);
      fetchStaffData();
    } catch (err) {
      toast.error(err.message || 'Failed to update reservation');
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchStaffData();
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading floor and orders overview..." />;
  }

  const {
    summary,
    tables = [],
    tableStatusSummary,
    recentOrders = [],
    upcomingReservations = [],
    activeKitchenOrders = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
            Operations & Service
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-0.5">
            Restaurant Staff Control
          </h1>
        </div>

        <Button variant="outline" size="sm" onClick={fetchStaffData} icon={RefreshCw}>
          Refresh Live Data
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Orders
            </span>
            <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">
              {summary?.todayOrders || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Orders
            </span>
            <h3 className="text-2xl font-bold font-serif text-amber-600 mt-1">
              {summary?.activeOrders || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Reservations
            </span>
            <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">
              {summary?.todayReservations || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Tables
            </span>
            <h3 className="text-2xl font-bold font-serif text-emerald-600 mt-1">
              {tableStatusSummary?.available || 0} / {tableStatusSummary?.total || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Grid className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Floor Table Quick Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900">Live Table Floor Status</h2>
            <p className="text-xs text-slate-500">
              Toggle availability, reservations, and cleaning states
            </p>
          </div>
          <Link to="/staff/tables">
            <Button variant="outline" size="sm">
              Manage Tables
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onStatusChange={handleTableStatusChange}
              canManage={true}
            />
          ))}
        </div>
      </div>

      {/* Recent Orders & Reservations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Incoming Orders Stream */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold font-serif text-slate-900">
              Active & Incoming Orders
            </h3>
            <Link to="/staff/orders" className="text-xs font-semibold text-amber-600 hover:underline">
              View All Orders Feed
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                label: order.status,
                color: 'bg-slate-100 text-slate-800',
              };

              return (
                <div
                  key={order.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {order.customerName} • {order.orderType.replace('_', ' ')}
                      {order.table && ` (Table #${order.table.tableNumber})`}
                    </p>
                    <p className="text-slate-400 text-[11px] truncate max-w-sm mt-0.5">
                      {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 font-sans">
                      ₹{order.totalAmount?.toFixed(2)}
                    </span>

                    {/* Quick status dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                      className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700 shadow-xs cursor-pointer focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="PLACED">Placed</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    <button
                      onClick={() => setInspectOrder(order)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 transition"
                      aria-label="View order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Reservations Desk */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold font-serif text-slate-900">
              Upcoming Reservations
            </h3>
            <Link
              to="/staff/reservations"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Full Schedule
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingReservations.map((resv) => (
              <div
                key={resv.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2"
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{resv.customerName}</span>
                  <span className="text-amber-600 text-[10px] uppercase font-bold">
                    {resv.status}
                  </span>
                </div>

                <div className="text-slate-500 space-y-0.5">
                  <p>
                    {new Date(resv.reservationDate).toLocaleDateString()} at{' '}
                    <strong className="text-slate-700">{resv.reservationTime}</strong> •{' '}
                    {resv.guestsCount} Guests
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Phone: {resv.customerPhone}{' '}
                    {resv.table && `• Assigned Table #${resv.table.tableNumber}`}
                  </p>
                </div>

                {resv.status === 'PENDING' && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] py-1"
                      onClick={() => handleReservationStatusChange(resv.id, 'CANCELLED')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="text-[11px] py-1"
                      onClick={() => handleReservationStatusChange(resv.id, 'CONFIRMED')}
                    >
                      Confirm Table
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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

export default StaffDashboardPage;
