import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrderCard = ({ order, onCancel, onReturn }) => {
  const isCancellable = ['PLACED', 'CONFIRMED'].includes(order.status);
  const isReturnable = order.status === 'DELIVERED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition-all">
      {/* Order Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-50/60 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Grand Total</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatCurrency(order.grandTotal)}
            </span>
          </div>

          <Link
            to={`/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <span>Order Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Items Preview */}
      <div className="p-5 divide-y divide-slate-100">
        {order.items?.map((item) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                alt={item.product?.name}
                className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.product?.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Vendor: <strong className="text-indigo-600">{item.product?.vendor?.businessName || 'MarketHub Partner'}</strong></span>
                  <span>• Qty: {item.quantity}</span>
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-slate-800 shrink-0">
              {formatCurrency(item.totalPrice)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <Truck className="w-4 h-4 text-indigo-600" />
          <span>
            {order.delivery?.deliveryPartner
              ? `Delivery by ${order.delivery.deliveryPartner.name}`
              : 'Delivery Partner Assigned'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCancellable && onCancel && (
            <button
              onClick={() => onCancel(order.id)}
              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
            >
              Cancel Order
            </button>
          )}

          {isReturnable && onReturn && (
            <button
              onClick={() => onReturn(order.id)}
              className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold transition-colors"
            >
              Request Return
            </button>
          )}

          <Link
            to={`/orders/${order.id}/tracking`}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors"
          >
            Track Delivery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
