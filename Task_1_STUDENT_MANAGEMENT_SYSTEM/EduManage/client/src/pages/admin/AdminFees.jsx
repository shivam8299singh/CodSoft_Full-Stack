import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Online / Card');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // New Fee Record Modal
  const [newFeeModalOpen, setNewFeeModalOpen] = useState(false);
  const [newFeeForm, setNewFeeForm] = useState({
    studentId: '',
    academicYear: '2025-2026',
    semester: 1,
    totalAmount: 4500,
    dueDate: '2025-12-15',
    paidAmount: 0
  });
  const [newFeeLoading, setNewFeeLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, [search, statusFilter]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students?limit=100');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (e) {}
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees', {
        params: {
          search,
          status: statusFilter
        }
      });
      if (res.data.success) {
        setFees(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load fee records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  let totalRevenue = 0;
  let totalCollected = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let partialCount = 0;

  fees.forEach((f) => {
    totalRevenue += f.totalAmount;
    totalCollected += f.paidAmount;
    if (f.status === 'PAID') paidCount++;
    else if (f.status === 'PARTIAL') partialCount++;
    else pendingCount++;
  });

  const pendingAmount = totalRevenue - totalCollected;

  const handleOpenPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount((fee.totalAmount - fee.paidAmount).toString());
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFee || !paymentAmount) return;
    try {
      setPaymentLoading(true);
      const res = await api.put(`/fees/${selectedFee.id}/pay`, {
        paymentAmount: parseFloat(paymentAmount),
        paymentMethod
      });
      if (res.data.success) {
        showToast('Payment recorded successfully', 'success');
        setPaymentModalOpen(false);
        fetchFees();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment recording failed', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCreateNewFee = async (e) => {
    e.preventDefault();
    try {
      setNewFeeLoading(true);
      const res = await api.post('/fees', newFeeForm);
      if (res.data.success) {
        showToast('Fee invoice record created', 'success');
        setNewFeeModalOpen(false);
        fetchFees();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create fee record', 'error');
    } finally {
      setNewFeeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Fee Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track tuition fee assessments, process incoming payments, and monitor arrears.
          </p>
        </div>
        <Button
          onClick={() => {
            setNewFeeForm({
              ...newFeeForm,
              studentId: students[0]?.id || ''
            });
            setNewFeeModalOpen(true);
          }}
          icon={Plus}
        >
          Generate Fee Invoice
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalCollected)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">{paidCount} fully paid accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(pendingAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">{pendingCount + partialCount} accounts in arrears</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid In Full</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{paidCount} Students</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Clear of financial holds</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending or Partial</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount + partialCount} Students</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires collection follow-up</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['', 'PAID', 'PARTIAL', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === '' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving financial ledger..." />
        ) : fees.length === 0 ? (
          <EmptyState
            title="No fee records found"
            description="Generate a new fee invoice or change the status filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Program & Term</th>
                  <th className="py-3.5 px-4">Total Assessed</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Outstanding Balance</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {fees.map((fee) => {
                  const balance = fee.totalAmount - fee.paidAmount;
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{fee.student?.fullName}</span>
                          <span className="font-mono text-[11px] text-slate-400">{fee.student?.studentId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          Semester {fee.semester}
                        </span>
                        <span className="text-[11px] text-slate-400">{fee.academicYear}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(fee.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        {formatCurrency(fee.paidAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {formatDate(fee.dueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={fee.status === 'PAID' ? 'success' : (fee.status === 'PARTIAL' ? 'warning' : 'danger')}
                        >
                          {fee.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {balance > 0 ? (
                          <button
                            onClick={() => handleOpenPaymentModal(fee)}
                            className="px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors font-bold text-xs"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-xs flex items-center justify-end">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Fee Payment"
        description={`Record incoming remittance for ${selectedFee?.student?.fullName} (${selectedFee?.student?.studentId}).`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Total Due</span>
              <span className="font-bold text-slate-800">{formatCurrency(selectedFee?.totalAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Already Paid</span>
              <span className="font-bold text-emerald-600">{formatCurrency(selectedFee?.paidAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Remaining Due</span>
              <span className="font-bold text-rose-600">
                {formatCurrency(selectedFee ? selectedFee.totalAmount - selectedFee.paidAmount : 0)}
              </span>
            </div>
          </div>

          <Input
            label="Payment Amount ($)"
            type="number"
            step="0.01"
            min="1"
            max={selectedFee ? selectedFee.totalAmount - selectedFee.paidAmount : 10000}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />

          <Select
            label="Remittance Method"
            options={[
              { label: 'Online / Card Payment', value: 'Online / Card Payment' },
              { label: 'Bank Wire / ACH', value: 'Bank Wire / ACH' },
              { label: 'Institutional Check / Cheque', value: 'Institutional Check' },
              { label: 'Cash Remittance', value: 'Cash' },
            ]}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={paymentLoading}>
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate Fee Invoice Modal */}
      <Modal
        isOpen={newFeeModalOpen}
        onClose={() => setNewFeeModalOpen(false)}
        title="Generate New Fee Invoice"
        description="Assess academic tuition and laboratory dues for a matriculated student."
      >
        <form onSubmit={handleCreateNewFee} className="space-y-4">
          <Select
            label="Matriculated Student"
            options={students.map((s) => ({ label: `${s.fullName} (${s.studentId})`, value: s.id }))}
            value={newFeeForm.studentId}
            onChange={(e) => setNewFeeForm({ ...newFeeForm, studentId: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Academic Year"
              value={newFeeForm.academicYear}
              onChange={(e) => setNewFeeForm({ ...newFeeForm, academicYear: e.target.value })}
              required
            />
            <Select
              label="Semester"
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ label: `Semester ${s}`, value: s }))}
              value={newFeeForm.semester}
              onChange={(e) => setNewFeeForm({ ...newFeeForm, semester: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Fee Amount ($)"
              type="number"
              value={newFeeForm.totalAmount}
              onChange={(e) => setNewFeeForm({ ...newFeeForm, totalAmount: e.target.value })}
              required
            />
            <Input
              label="Payment Due Date"
              type="date"
              value={newFeeForm.dueDate}
              onChange={(e) => setNewFeeForm({ ...newFeeForm, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setNewFeeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={newFeeLoading}>
              Issue Fee Assessment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminFees;
