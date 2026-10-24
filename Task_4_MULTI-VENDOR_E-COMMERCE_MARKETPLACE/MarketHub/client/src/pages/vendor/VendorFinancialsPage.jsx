import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';

export const VendorFinancialsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vendor/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  }, []);

  if (loading) return <LoadingSpinner text="Calculating financials & commission ledger..." />;
  if (!data) return <div>Failed to load financial records.</div>;

  const { summary } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financials & Commission Ledger</h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete breakdown of gross marketplace GMV, marketplace commission fees, and net vendor earnings
        </p>
      </div>

      {/* Financial Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">1. Gross Marketplace Sales</span>
          <p className="text-3xl font-black text-slate-900">{formatCurrency(summary.grossSales)}</p>
          <p className="text-[11px] text-slate-400">Total consumer expenditure across your products</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">2. Marketplace Commission Fee</span>
          <p className="text-3xl font-black text-rose-600">-{formatCurrency(summary.marketplaceCommission)}</p>
          <p className="text-[11px] text-slate-400">Fixed 10% platform hosting, listing & gateway fee</p>
        </div>

        <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-2 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">3. Net Vendor Earnings</span>
          <p className="text-3xl font-black text-emerald-700">{formatCurrency(summary.netEarnings)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Direct balance eligible for scheduled disbursement</p>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 text-xs space-y-3">
        <h3 className="text-sm font-bold text-white">How MarketHub Marketplace Commission Works</h3>
        <p className="leading-relaxed">
          MarketHub operates a transparent marketplace model. For every order containing your items, the customer pays the listed price. Our backend automatically creates a vendor sub-order and deducts the agreed commission percentage, recording the net payable amount directly in your earnings ledger.
        </p>
      </div>
    </div>
  );
};

export default VendorFinancialsPage;
