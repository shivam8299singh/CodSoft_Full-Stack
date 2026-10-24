import { CheckCircle2, CreditCard, DollarSign, QrCode, RefreshCw, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { orderService } from '../../services/orderService';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllPayments({ status: statusFilter });
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Payment Transactions</h1>
          <p className="text-xs text-slate-500">Track online receipts, card charges, and cash reconciliations</p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchPayments} icon={RefreshCw}>
          Refresh Ledger
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Settled Revenue
          </span>
          <h3 className="text-2xl font-bold text-slate-900 font-sans mt-1">
            ₹{totalCollected.toFixed(2)}
          </h3>
          <span className="text-[11px] text-emerald-600 font-medium">Successfully processed</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Transactions Count
          </span>
          <h3 className="text-2xl font-bold text-slate-900 font-sans mt-1">
            {payments.length}
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Total recorded entries</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Payment Mode Gateways
          </span>
          <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-amber-600" /> UPI
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Card
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Cash
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSpinner text="Fetching financial records..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description="Transactions will be registered when customers place orders or clear dine-in bills."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {p.transactionId || `TXN-${p.id.substring(0, 8).toUpperCase()}`}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-amber-600">
                      {p.order?.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{p.order?.customerName}</p>
                      <p className="text-slate-400 text-[11px]">{p.order?.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {p.paymentMethod}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-900 font-sans text-sm">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          p.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
