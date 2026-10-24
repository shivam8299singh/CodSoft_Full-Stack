import {
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const OrderTrackPage = () => {
  const { orderNumber: paramOrderNumber } = useParams();
  const [searchInput, setSearchInput] = useState(paramOrderNumber || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchOrder = async (numberToFetch) => {
    if (!numberToFetch || !numberToFetch.trim()) return;
    setLoading(true);
    try {
      const data = await orderService.trackOrder(numberToFetch.trim().toUpperCase());
      setOrder(data);
    } catch (err) {
      toast.error(err.message || 'No order found with this reference number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) {
      fetchOrder(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim().toUpperCase()}`);
    }
  };

  const statusInfo = order ? ORDER_STATUS_LABELS[order.status] || {
    label: order.status,
    color: 'bg-slate-100 text-slate-800',
  } : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
          Live Order Updates
        </span>
        <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
          Track Your Meal
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter your unique order number to check real-time kitchen preparation and delivery status.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. ORD-1001"
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-semibold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <Button type="submit" size="md">
            Track
          </Button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Locating your order status..." />
      ) : order ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-8 animate-in zoom-in-95">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Order Reference</span>
              <div className="flex items-center gap-3 mt-0.5">
                <h2 className="text-2xl font-bold font-serif text-slate-900">{order.orderNumber}</h2>
                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchOrder(order.orderNumber)}
            >
              Refresh Status
            </Button>
          </div>

          {/* Visual Progress Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Preparation Timeline
            </h4>
            <OrderTimeline currentStatus={order.status} orderType={order.orderType} />
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Service Mode
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <UtensilsCrossed className="w-4 h-4 text-slate-500" />
                {order.orderType.replace('_', ' ')}
                {order.table && (
                  <span className="text-amber-600 font-bold ml-1">
                    (Table #{order.table.tableNumber})
                  </span>
                )}
              </div>
              {order.deliveryAddress && (
                <p className="pt-1 flex items-start gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order.deliveryAddress}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Info
              </span>
              <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                <span>Total Amount:</span>
                <span className="text-amber-600 font-sans text-base">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
              <p className="pt-1 text-slate-500">
                Method: {order.payment?.paymentMethod || 'Online'} • Status:{' '}
                <span className="font-bold text-emerald-600">{order.payment?.status || 'PAID'}</span>
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Order Items ({order.items?.length || 0})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {order.items?.map((it) => (
                <div key={it.id} className="p-3.5 flex items-center justify-between bg-white text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{it.quantity}x </span>
                    <span className="text-slate-800 font-medium">{it.name}</span>
                    {it.specialInstructions && (
                      <span className="block text-[11px] text-amber-700 italic">
                        Note: {it.specialInstructions}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 font-sans">
                    ₹{(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Enter an Order Number</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Example demo orders you can try tracking:{' '}
            <span className="font-mono font-bold text-amber-600 cursor-pointer hover:underline" onClick={() => { setSearchInput('ORD-1001'); fetchOrder('ORD-1001'); }}>
              ORD-1001
            </span>
            ,{' '}
            <span className="font-mono font-bold text-amber-600 cursor-pointer hover:underline" onClick={() => { setSearchInput('ORD-1002'); fetchOrder('ORD-1002'); }}>
              ORD-1002
            </span>
            , or{' '}
            <span className="font-mono font-bold text-amber-600 cursor-pointer hover:underline" onClick={() => { setSearchInput('ORD-1003'); fetchOrder('ORD-1003'); }}>
              ORD-1003
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackPage;
