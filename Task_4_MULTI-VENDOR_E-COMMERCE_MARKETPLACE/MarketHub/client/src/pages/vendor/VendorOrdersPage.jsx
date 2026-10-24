import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Package, Truck, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Table from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/vendor/orders?status=${statusFilter}` : '/vendor/orders';
      const res = await api.get(url);
      if (res.data?.success) {
        setOrders(res.data.data);
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

  const handleUpdateStatus = async (vendorOrderId, newStatus) => {
    try {
      setUpdatingId(vendorOrderId);
      const res = await api.put(`/vendor/orders/${vendorOrderId}/status`, {
        status: newStatus,
      });

      if (res.data?.success) {
        addToast(`Order status updated to ${newStatus}`);
        await fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading vendor orders..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Fulfillment Orders</h2>
          <p className="text-xs text-slate-500 mt-1">
            Orders containing items fulfilled by your warehouse
          </p>
        </div>

        {/* Status Filter */}
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
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>
      </div>

      <Table headers={['Order #', 'Date & Customer', 'Items & Qty', 'Subtotal & Net Payout', 'Status', 'Fulfillment Step']}>
        {orders.map((vo) => (
          <tr key={vo.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
              {vo.order?.orderNumber}
            </td>

            <td className="px-6 py-4">
              <span className="font-semibold text-slate-800 text-xs block">
                {vo.order?.user?.name || 'Customer'}
              </span>
              <span className="text-[10px] text-slate-400 block">{formatDate(vo.createdAt)}</span>
              <span className="text-[10px] text-slate-400 block">{vo.order?.shippingAddress?.city}</span>
            </td>

            <td className="px-6 py-4 text-xs space-y-1">
              {vo.items?.map((it) => (
                <div key={it.id} className="text-slate-700">
                  <span className="font-medium text-slate-800">{it.product?.name}</span>{' '}
                  <span className="text-slate-400 font-bold">x{it.quantity}</span>
                </div>
              ))}
            </td>

            <td className="px-6 py-4">
              <span className="font-extrabold text-slate-900 text-xs block">{formatCurrency(vo.subtotal)}</span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                Net: {formatCurrency(vo.netEarnings)}
              </span>
              <span className="text-[9px] text-slate-400 block">Comm: -{formatCurrency(vo.commissionAmount)}</span>
            </td>

            <td className="px-6 py-4">
              <StatusBadge status={vo.status} />
            </td>

            <td className="px-6 py-4">
              {vo.status === 'PLACED' && (
                <button
                  onClick={() => handleUpdateStatus(vo.id, 'CONFIRMED')}
                  disabled={updatingId === vo.id}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
                >
                  Confirm Order
                </button>
              )}
              {vo.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleUpdateStatus(vo.id, 'PROCESSING')}
                  disabled={updatingId === vo.id}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors"
                >
                  Start Packing
                </button>
              )}
              {vo.status === 'PROCESSING' && (
                <button
                  onClick={() => handleUpdateStatus(vo.id, 'SHIPPED')}
                  disabled={updatingId === vo.id}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
                >
                  Mark as Shipped
                </button>
              )}
              {['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(vo.status) && (
                <span className="text-slate-400 text-xs font-semibold">Completed Step</span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default VendorOrdersPage;
