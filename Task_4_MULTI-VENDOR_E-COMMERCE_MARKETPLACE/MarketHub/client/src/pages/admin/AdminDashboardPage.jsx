import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Percent,
  Clock,
  Truck,
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
  BarChart,
  Bar
} from 'recharts';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Aggregating marketplace telemetry..." />;
  if (!data) return <div>Failed to load admin metrics.</div>;

  const {
    summary,
    salesTimeline = [],
    categoryDistribution = [],
    topVendors = [],
  } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Operations & GMV</h2>
        <p className="text-xs text-slate-500 mt-1">
          High-level ecosystem health, commission earnings, and merchant activity
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Marketplace GMV</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-[11px] text-slate-400">{summary.totalOrders} total marketplace orders</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Commission (Revenue)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(summary.marketplaceCommission)}</p>
          <p className="text-[11px] text-slate-400">Net earned marketplace rake</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.pendingVendors}</p>
          <Link to="/admin/vendors?status=PENDING" className="text-[11px] text-amber-700 font-bold hover:underline">
            Review vendor applications &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Deliveries</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.activeDeliveries}</p>
          <p className="text-[11px] text-slate-400">{summary.totalVendors} approved sellers</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GMV Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Gross Merchandise Value (GMV)</h3>
            <span className="text-xs text-slate-400">14-Day Trajectory</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTimeline}>
                <defs>
                  <linearGradient id="adminGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#adminGmv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown BarChart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Products Across Categories</h3>
            <span className="text-xs text-slate-400">Catalog Density</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val) => [val, 'Listed SKUs']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Vendors */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Top Verified Merchant Partners</h3>
          <Link to="/admin/vendors" className="text-xs font-bold text-indigo-600 hover:underline">
            Manage All Vendors &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {topVendors.map((v) => (
            <div key={v.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{v.businessName}</span>
                  <span className="text-[10px] text-slate-400">{v.productsCount} products listed</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-slate-900 text-xs block">{formatCurrency(v.totalSales)}</span>
                <span className="text-[10px] text-slate-400">{v.ordersCount} orders fulfilled</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
