import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, User, ArrowUpDown, ChevronDown, Store } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Table from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [assignModalOrder, setAssignModalOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
      const res = await api.get(url);
      if (res.data?.success) {
        setOrders(res.data.data);
        setDeliveryPartners(res.data.deliveryPartners || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleAssignDelivery = async (e) => {
    e.preventDefault();
    if (!assignModalOrder || !selectedPartnerId) return;
    try {
      setSavingAssignment(true);
      const res = await api.put(`/admin/orders/${assignModalOrder.id}/assign-delivery`, {
        deliveryPartnerId: selectedPartnerId,
      });

      if (res.data?.success) {
        addToast('Delivery partner assigned successfully!');
        setAssignModalOrder(null);
        await fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSavingAssignment(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading marketplace order books..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Master Orders</h2>
          <p className="text-xs text-slate-500 mt-1">Supervise parent orders, multi-vendor splits, and dispatch operations</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="">All Order Statuses</option>
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <Table headers={['Order # & Date', 'Customer', 'Sellers Involved', 'Total', 'Payment', 'Status', 'Courier Dispatch']}>
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <span className="font-mono font-bold text-slate-900 text-xs block">#{o.orderNumber}</span>
              <span className="text-[10px] text-slate-400">{formatDate(o.createdAt)}</span>
            </td>

            <td className="px-6 py-4 text-xs">
              <span className="font-bold text-slate-800 block">{o.user?.name}</span>
              <span className="text-[11px] text-slate-400">{o.shippingAddress?.city}</span>
            </td>

            <td className="px-6 py-4 text-xs font-medium text-slate-700">
              <div className="space-y-1">
                {o.vendorOrders?.map((vo) => (
                  <span key={vo.id} className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[10px] mr-1">
                    {vo.vendor.businessName}
                  </span>
                ))}
              </div>
            </td>

            <td className="px-6 py-4 font-extrabold text-slate-900 text-xs">
              {formatCurrency(o.grandTotal)}
            </td>

            <td className="px-6 py-4 text-xs">
              <span className="font-semibold text-slate-700 block">{o.payment?.method}</span>
              <span className={`text-[10px] font-bold ${o.payment?.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {o.payment?.status}
              </span>
            </td>

            <td className="px-6 py-4">
              <StatusBadge status={o.status} />
            </td>

            <td className="px-6 py-4">
              <button
                onClick={() => {
                  setAssignModalOrder(o);
                  setSelectedPartnerId(o.delivery?.deliveryPartnerId || deliveryPartners[0]?.id || '');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{o.delivery?.deliveryPartner?.name || 'Assign Partner'}</span>
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Assign Delivery Partner Modal */}
      <Modal
        isOpen={!!assignModalOrder}
        onClose={() => setAssignModalOrder(null)}
        title={`Assign Logistics Carrier: #${assignModalOrder?.orderNumber}`}
      >
        <form onSubmit={handleAssignDelivery} className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a verified delivery partner to pick up and fulfill order #{assignModalOrder?.orderNumber} to {assignModalOrder?.shippingAddress?.city}.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Available Delivery Partners
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              {deliveryPartners.map((dp) => (
                <option key={dp.id} value={dp.id}>
                  {dp.name} ({dp.vehicleType} • {dp.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setAssignModalOrder(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={savingAssignment}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
