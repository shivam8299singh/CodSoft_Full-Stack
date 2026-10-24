import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Receipt, Download } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const StudentFees = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving financial statement..." size="lg" />;
  }

  const fee = data?.feeDetails || {};
  const student = data?.student || {};
  const balance = (fee.totalAmount || 4500) - (fee.paidAmount || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tuition & Financial Statement</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review assessed tuition fees, payment allocations, receipts, and outstanding obligations.
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          icon={Download}
        >
          Print Invoice
        </Button>
      </div>

      {/* KPI Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Assessed Fees</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(fee.totalAmount || 4500)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Semester {fee.semester || 3} • {fee.academicYear || '2025-2026'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remitted Amount</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(fee.paidAmount || 0)}</p>
          <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">Credited to Account</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
          <p className={`text-2xl font-black mt-1 ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {formatCurrency(balance)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Due by {formatDate(fee.dueDate || '2025-11-30')}</span>
        </div>
      </div>

      {/* Invoice Card */}
      <Card>
        <CardHeader
          title="Current Term Fee Invoice"
          subtitle={`Billing Reference: INV-2025-${student.studentId?.replace('STU-', '') || '1001'}`}
          action={
            <Badge variant={fee.status === 'PAID' ? 'success' : (fee.status === 'PARTIAL' ? 'warning' : 'danger')}>
              {fee.status || 'PAID'}
            </Badge>
          }
        />
        <CardBody className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Candidate</span>
              <span className="font-bold text-slate-900">{student.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Student ID</span>
              <span className="font-mono font-bold text-slate-900">{student.studentId}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <span className="font-semibold text-slate-800">{fee.paymentMethod || 'Online / Card'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Last Settlement</span>
              <span className="font-semibold text-slate-800">{formatDate(fee.lastPaymentDate || fee.dueDate)}</span>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Term</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Undergraduate Degree Tuition Assessment</td>
                  <td className="py-3 px-4">Semester {fee.semester}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(3600)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Computing Infrastructure & Library Dues</td>
                  <td className="py-3 px-4">Semester {fee.semester}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(600)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Student Services & Examination Assessment</td>
                  <td className="py-3 px-4">Semester {fee.semester}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(300)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/70 font-bold border-t border-slate-200">
                  <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-[11px] text-slate-500">
                    Total Assessed
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-slate-900">
                    {formatCurrency(fee.totalAmount || 4500)}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={2} className="py-2 px-4 text-right uppercase tracking-wider text-[11px] text-emerald-600">
                    Remitted Payment
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-sm text-emerald-600">
                    - {formatCurrency(fee.paidAmount || 0)}
                  </td>
                </tr>
                <tr className="font-black bg-indigo-50/50 border-t border-indigo-100 text-indigo-900">
                  <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                    Net Balance Remaining
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base">
                    {formatCurrency(balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default StudentFees;
