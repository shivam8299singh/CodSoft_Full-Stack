import {
  CalendarCheck,
  CreditCard,
  DollarSign,
  Eye,
  Grid,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import { dashboardService } from '../../services/dashboardService';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const COLORS = ['#d97706', '#2563eb', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspectOrder, setInspectOrder] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing restaurant financial & operational analytics..." />;
  }

  const { kpis, charts, recentOrders = [], recentReservations = [] } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
            Executive Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-0.5">
            Restaurant Analytics & Operations
          </h1>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAdminData} icon={RefreshCw}>
          Refresh Analytics
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1 font-sans">
              ₹{(kpis?.totalRevenue || 0).toFixed(2)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              + Today: ₹{(kpis?.todayRevenue || 0).toFixed(2)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              {kpis?.totalOrders || 0}
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
              {kpis?.todayOrders || 0} placed today
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dining Guests
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              {kpis?.totalCustomers || 0}
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Registered customers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Tables
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              {kpis?.availableTables || 0} / {kpis?.totalTables || 0}
            </h3>
            <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">
              {kpis?.activeReservations || 0} active reservations
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Grid className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue & Orders Trend (7 Days) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">
                Revenue & Daily Order Volume
              </h3>
              <p className="text-xs text-slate-500">Gross earnings (₹) over the last 7 calendar days</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val, name) => [name === 'revenue' ? `₹${val}` : val, name === 'revenue' ? 'Revenue' : 'Orders']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={3} name="Revenue (₹)" />
                <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} name="Orders Count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Donut */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold font-serif text-slate-900">Order Status Breakdown</h3>
            <p className="text-xs text-slate-500">Current operational distribution</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.orderStatusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.orderStatusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Dishes Bar Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold font-serif text-slate-900">
            Top Performing Bestseller Dishes
          </h3>
          <p className="text-xs text-slate-500">Highest volume culinary creations ordered by guests</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.popularItems || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="name" type="category" width={160} stroke="#475569" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="totalSold" fill="#d97706" radius={[0, 8, 8, 0]} name="Portions Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold font-serif text-slate-900">Latest Restaurant Orders</h3>
          <Link to="/admin/orders" className="text-xs font-semibold text-amber-600 hover:underline">
            Manage All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Order Ref</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => {
                const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                  label: order.status,
                  color: 'bg-slate-100 text-slate-800',
                };
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {order.orderType.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 font-sans">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setInspectOrder(order)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

export default AdminDashboardPage;
