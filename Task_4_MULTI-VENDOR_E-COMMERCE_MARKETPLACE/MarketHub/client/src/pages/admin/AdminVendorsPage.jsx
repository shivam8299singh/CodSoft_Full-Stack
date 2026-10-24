import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store, Check, X, Ban, ShieldCheck, ArrowUpDown, Percent } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminVendorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || '';

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [commissionModalVendor, setCommissionModalVendor] = useState(null);
  const [commissionRate, setCommissionRate] = useState('10');
  const { addToast } = useToast();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const url = statusParam ? `/admin/vendors?status=${statusParam}` : '/admin/vendors';
      const res = await api.get(url);
      if (res.data?.success) {
        setVendors(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusParam]);

  const handleUpdateStatus = async (vendorId, status) => {
    try {
      setUpdatingId(vendorId);
      const res = await api.put(`/admin/vendors/${vendorId}/status`, { status });
      if (res.data?.success) {
        addToast(`Vendor account updated to ${status}`);
        await fetchVendors();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    if (!commissionModalVendor) return;
    try {
      setUpdatingId(commissionModalVendor.id);
      const res = await api.put(`/admin/vendors/${commissionModalVendor.id}/status`, {
        commissionRate: parseFloat(commissionRate),
      });
      if (res.data?.success) {
        addToast('Vendor commission rate adjusted successfully!');
        setCommissionModalVendor(null);
        await fetchVendors();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading vendor registrations..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Governance & Approvals</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review pending applications, inspect business compliance, and manage platform fee rates
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusParam}
            onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}
            className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      <Table headers={['Business / Merchant', 'Contact & Address', 'Commission Rate', 'Catalog / Orders', 'Status', 'Administrative Action']}>
        {vendors.map((v) => (
          <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{v.businessName}</span>
                  <span className="text-[11px] text-slate-400">Owner: {v.ownerName}</span>
                </div>
              </div>
            </td>

            <td className="px-6 py-4 text-xs">
              <span className="text-slate-800 font-medium block">{v.email}</span>
              <span className="text-slate-400 text-[11px] block">{v.phone || 'No phone'}</span>
              <span className="text-slate-500 text-[10px] block truncate max-w-xs">{v.address}</span>
            </td>

            <td className="px-6 py-4">
              <button
                onClick={() => {
                  setCommissionModalVendor(v);
                  setCommissionRate(String(v.commissionRate));
                }}
                className="font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
                title="Edit commission %"
              >
                <Percent className="w-3 h-3" />
                <span>{v.commissionRate}% Fee</span>
              </button>
            </td>

            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
              <span className="block">{v._count?.products || 0} products</span>
              <span className="text-slate-400 text-[10px]">{v._count?.vendorOrders || 0} fulfilled orders</span>
            </td>

            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                v.status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700'
                  : v.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : 'bg-rose-50 text-rose-700'
              }`}>
                {v.status}
              </span>
            </td>

            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                {v.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(v.id, 'APPROVED')}
                      disabled={updatingId === v.id}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(v.id, 'REJECTED')}
                      disabled={updatingId === v.id}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                )}

                {v.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(v.id, 'SUSPENDED')}
                    disabled={updatingId === v.id}
                    className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Suspend
                  </button>
                )}

                {v.status === 'SUSPENDED' && (
                  <button
                    onClick={() => handleUpdateStatus(v.id, 'APPROVED')}
                    disabled={updatingId === v.id}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Reactivate
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Edit Commission Modal */}
      <Modal
        isOpen={!!commissionModalVendor}
        onClose={() => setCommissionModalVendor(null)}
        title={`Set Commission: ${commissionModalVendor?.businessName}`}
      >
        <form onSubmit={handleSaveCommission} className="space-y-4">
          <p className="text-xs text-slate-500">
            Configure the percentage retained by MarketHub for every successful customer transaction fulfilled by this vendor.
          </p>

          <Input
            label="Marketplace Commission Rate (%)"
            type="number"
            step="0.5"
            min="0"
            max="50"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setCommissionModalVendor(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={updatingId === commissionModalVendor?.id}>
              Update Commission
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVendorsPage;
