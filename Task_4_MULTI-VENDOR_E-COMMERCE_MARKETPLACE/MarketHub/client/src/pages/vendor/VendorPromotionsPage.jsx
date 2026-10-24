import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, Percent } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

export const VendorPromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '15',
    minOrder: '1000',
    maxDiscount: '500',
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '100',
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendor/promotions');
      if (res.data?.success) {
        setPromotions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/vendor/promotions', form);
      if (res.data?.success) {
        addToast('Promotion coupon created successfully!');
        setModalOpen(false);
        setForm({
          code: '',
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: '15',
          minOrder: '1000',
          maxDiscount: '500',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usageLimit: '100',
        });
        await fetchPromotions();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vendor/promotions/${id}`);
      addToast('Promotion deleted');
      await fetchPromotions();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading promotions..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Promotions & Coupons</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create discount vouchers for your storefront products to drive sales
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)} icon={Plus}>
          Create New Coupon
        </Button>
      </div>

      <Table headers={['Coupon Code', 'Discount', 'Min Order', 'Valid Until', 'Usage Limit', 'Times Used', 'Actions']}>
        {promotions.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg text-xs">
                {p.code}
              </span>
              {p.description && <span className="block text-[11px] text-slate-400 mt-1">{p.description}</span>}
            </td>

            <td className="px-6 py-4 font-bold text-slate-900 text-xs">
              {p.discountType === 'PERCENTAGE' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}
            </td>

            <td className="px-6 py-4 text-xs font-semibold text-slate-600">
              ₹{p.minOrder}
            </td>

            <td className="px-6 py-4 text-xs text-slate-500">
              {formatDate(p.endDate)}
            </td>

            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
              {p.usageLimit}
            </td>

            <td className="px-6 py-4">
              <span className="font-extrabold text-emerald-600 text-xs">
                {p._count?.usages ?? p.timesUsed}
              </span>
            </td>

            <td className="px-6 py-4">
              <button
                onClick={() => handleDelete(p.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Vendor Discount Promotion"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Promo Coupon Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. FLASH25"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Discount Type
              </label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat Fixed Amount (₹)</option>
              </select>
            </div>

            <Input
              label="Discount Value"
              type="number"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Order Value (₹)"
              type="number"
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
            />
            <Input
              label="Max Discount Cap (₹)"
              type="number"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="End / Expiry Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
            <Input
              label="Total Usage Limit"
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              required
            />
          </div>

          <Input
            label="Promotion Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Special weekend sale voucher"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorPromotionsPage;
