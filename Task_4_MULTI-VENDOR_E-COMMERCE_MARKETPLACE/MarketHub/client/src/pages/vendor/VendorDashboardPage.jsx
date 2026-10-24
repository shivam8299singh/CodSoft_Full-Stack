import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

export const VendorDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vendor/dashboard');
        if (res.data?.success) {
          setDashboard(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading vendor analytics..." />;
  if (!dashboard) return <div>Failed to load vendor metrics.</div>;

  const { summary, salesChart = [], statusChart = [], topProducts = [] } = dashboard;
  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Performance Overview</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time telemetry on revenue, fulfillment, and product stock</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/vendor/products">
            <Button variant="primary" size="md" icon={Plus}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Sales */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(summary.grossSales)}</p>
          <p className="text-[11px] text-slate-500">
            Net Payout: <strong className="text-emerald-600">{formatCurrency(summary.netEarnings)}</strong> (10% comm.)
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.totalOrders}</p>
          <p className="text-[11px] text-slate-500">
            Today's orders: <strong className="text-indigo-600">+{summary.todayOrders}</strong>
          </p>
        </div>

        {/* Pending Fulfillment */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.pendingOrders}</p>
          <Link to="/vendor/orders" className="text-[11px] text-amber-700 font-bold hover:underline">
            Requires warehouse pack &rarr;
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.lowStockProducts}</p>
          <Link to="/vendor/inventory" className="text-[11px] text-rose-700 font-bold hover:underline">
            Restock inventory &rarr;
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Timeline Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Revenue & Sales Trends</h3>
            <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Sales']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900">Order Fulfillment Status</h3>

          <div className="h-56 w-full flex items-center justify-center">
            {statusChart.length === 0 ? (
              <span className="text-xs text-slate-400">No order data yet</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {statusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {statusChart.map((s, idx) => (
              <div key={s.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 font-medium truncate">{s.status}:</span>
                <strong className="text-slate-900">{s.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Top Velocity Products</h3>
          <Link to="/vendor/products" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Products &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {topProducts.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800">{p.name}</p>
                <p className="text-slate-400 mt-0.5">Price: {formatCurrency(p.price)}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-slate-600"><strong>{p.orders}</strong> orders</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${p.stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {p.stock} in stock
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
