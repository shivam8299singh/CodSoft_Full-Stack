import { Eye, MapPin, RefreshCw, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [inspectOrder, setInspectOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Your Order History</h2>
          <p className="text-xs text-slate-500">Track and review all your dining experiences</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PLACED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading orders..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="You haven't placed any orders matching this status yet."
          actionText="Explore Digital Menu"
          onAction={() => window.location.assign('/menu')}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = ORDER_STATUS_LABELS[order.status] || {
              label: order.status,
              color: 'bg-slate-100 text-slate-800',
            };

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-amber-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-slate-900 font-serif">
                      {order.orderNumber}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleString()} • {order.orderType.replace('_', ' ')}
                    {order.table && ` (Table #${order.table.tableNumber})`}
                  </p>

                  <div className="text-xs text-slate-600">
                    {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-lg font-bold text-slate-900 font-sans">
                    ₹{order.totalAmount?.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link to={`/track/${order.orderNumber}`}>
                      <Button variant="outline" size="sm">
                        Track
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => setInspectOrder(order)}
                      icon={Eye}
                    >
                      Receipt
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
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

export default CustomerOrdersPage;
