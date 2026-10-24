import { Eye, RefreshCw, Search, ShoppingBag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [inspectOrder, setInspectOrder] = useState(null);
  const toast = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders({
        search,
        status: statusFilter,
        orderType: typeFilter,
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Comprehensive Orders Control</h1>
          <p className="text-xs text-slate-500">View, audit receipts, and override order states across all channels</p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchOrders} icon={RefreshCw}>
          Refresh Queue
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="DINE_IN">Dine In</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner text="Fetching orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="Try changing your search terms or filters."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Mode / Table</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                    label: order.status,
                    color: 'bg-slate-100 text-slate-800',
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                        <span className="block text-[11px] font-sans font-normal text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-slate-400 text-[11px]">{order.customerPhone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">
                          {order.orderType.replace('_', ' ')}
                        </span>
                        {order.table && (
                          <span className="block text-[11px] text-amber-600 font-bold">
                            Table #{order.table.tableNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate text-slate-600">
                        {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </td>
                      <td className="px-5 py-4 font-extrabold text-slate-900 font-sans">
                        ₹{order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            order.payment?.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.payment?.paymentMethod || 'Online'} • {order.payment?.status || 'PAID'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-xs cursor-pointer focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="PLACED">Placed</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PREPARING">Preparing</option>
                            <option value="READY">Ready</option>
                            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>

                          <button
                            onClick={() => setInspectOrder(order)}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-400 transition"
                            aria-label="Inspect order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inspectOrder && (
        <OrderDetailModal
          order={inspectOrder}
          isOpen={Boolean(inspectOrder)}
          onClose={() => setInspectOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
