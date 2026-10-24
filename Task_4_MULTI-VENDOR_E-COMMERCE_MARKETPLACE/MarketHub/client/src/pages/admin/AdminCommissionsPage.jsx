import React, { useState, useEffect } from 'react';
import { Percent, DollarSign, CheckCircle2, Clock, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminCommissionsPage = () => {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);
  const { addToast } = useToast();

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/commissions');
      if (res.data?.success) {
        setCommissions(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleSettle = async (id) => {
    try {
      setSettlingId(id);
      const res = await api.put(`/admin/commissions/${id}/settle`);
      if (res.data?.success) {
        addToast('Vendor payout marked as settled successfully!');
        await fetchCommissions();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSettlingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Auditing commission payouts..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Commissions & Settlement Ledger</h2>
        <p className="text-xs text-slate-500 mt-1">Platform commission deduction auditing and vendor payout clearance</p>
      </div>

      {/* Summary Metrics */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Marketplace Commission</span>
            <span className="text-2xl font-black text-indigo-600">{formatCurrency(summary.totalCommissions)}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Vendor Payouts</span>
            <span className="text-2xl font-black text-slate-900">{formatCurrency(summary.totalPayouts)}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Settled Disbursed</span>
            <span className="text-2xl font-black text-emerald-600">{formatCurrency(summary.settledPayouts)}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Pending Clearance</span>
            <span className="text-2xl font-black text-amber-600">{formatCurrency(summary.pendingPayouts)}</span>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <Table headers={['Vendor / Store', 'Order Reference', 'Order Value', 'Marketplace Fee (%)', 'Net Vendor Payout', 'Payout Status', 'Clearance Action']}>
        {commissions.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <span className="font-bold text-slate-900 text-xs block">{c.vendor?.businessName}</span>
              <span className="text-[10px] text-slate-400">{c.vendor?.ownerName}</span>
            </td>

            <td className="px-6 py-4 font-mono font-bold text-indigo-700 text-xs">
              #{c.vendorOrder?.order?.orderNumber || 'MH-SUB'}
            </td>

            <td className="px-6 py-4 font-bold text-slate-900 text-xs">
              {formatCurrency(c.orderTotal)}
            </td>

            <td className="px-6 py-4">
              <span className="font-bold text-rose-600 text-xs">
                -{formatCurrency(c.commissionFee)} ({c.ratePercent}%)
              </span>
            </td>

            <td className="px-6 py-4 font-extrabold text-emerald-600 text-xs">
              {formatCurrency(c.netPayout)}
            </td>

            <td className="px-6 py-4">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                c.isSettled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {c.isSettled ? 'SETTLED' : 'PENDING'}
              </span>
            </td>

            <td className="px-6 py-4">
              {!c.isSettled ? (
                <button
                  onClick={() => handleSettle(c.id)}
                  disabled={settlingId === c.id}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Settle Payout
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Cleared</span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default AdminCommissionsPage;
