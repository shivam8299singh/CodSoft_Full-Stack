import {
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Printer,
  ShoppingBag,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import React from 'react';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import Button from '../common/Button';
import OrderTimeline from './OrderTimeline';

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusInfo = ORDER_STATUS_LABELS[order.status] || {
    label: order.status,
    color: 'bg-slate-100 text-slate-800',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 my-8 animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-serif">{order.orderNumber}</h3>
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Timeline */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Order Status Progress
            </h4>
            <OrderTimeline currentStatus={order.status} orderType={order.orderType} />
          </div>

          {/* Customer & Service Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Details
              </h5>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <User className="w-4 h-4 text-slate-400" />
                {order.customerName}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {order.customerPhone}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Service Mode
              </h5>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                {order.orderType.replace('_', ' ')}
                {order.table && (
                  <span className="text-xs text-amber-600 font-bold ml-1">
                    (Table #{order.table.tableNumber})
                  </span>
                )}
              </div>
              {order.deliveryAddress && (
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Receipt Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Ordered Items
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{it.name}</p>
                        {it.specialInstructions && (
                          <p className="text-[11px] text-amber-700 italic">
                            {it.specialInstructions}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {it.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        ₹{it.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 font-sans">
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-slate-800">₹{order.tax?.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-slate-800">
                    ₹{order.deliveryFee?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-amber-600 font-sans">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Payment: {order.payment?.paymentMethod || 'Online'}</span>
                <span className="font-bold text-emerald-600">
                  {order.payment?.status || 'PAID'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePrint} icon={Printer}>
            Print Receipt
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
