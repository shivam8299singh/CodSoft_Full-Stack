import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Printer, Truck, Package, Store } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data?.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen text="Confirming your order..." />;
  if (!order) return <div className="text-center py-20">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success banner */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Thank you for shopping on MarketHub. Your multi-vendor order <strong>#{order.orderNumber}</strong> has been placed and dispatched to sellers.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to={`/orders/${order.id}/tracking`}>
            <Button variant="primary" size="md" icon={Truck}>
              Track Order Live
            </Button>
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Market<span className="text-indigo-600">Hub</span> Invoice
            </span>
            <p className="text-xs text-slate-400 mt-0.5">Order ID: #{order.orderNumber}</p>
            <p className="text-xs text-slate-400">Date: {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={order.status} />
            <p className="text-xs text-slate-500 font-semibold mt-1">Payment: {order.payment?.method} ({order.payment?.status})</p>
          </div>
        </div>

        {/* Shipping details snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 pb-6 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Delivery Address</h4>
            <p className="font-semibold text-slate-800">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Fulfillment Partners</h4>
            <p className="font-semibold text-indigo-600">
              {order.vendorOrders?.map((vo) => vo.vendor.businessName).join(', ')}
            </p>
            <p className="text-slate-400 mt-1">
              Carrier: {order.delivery?.deliveryPartner?.name || 'Assigned Logistics Partner'}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">Purchased Items</h4>
          <div className="divide-y divide-slate-100 text-xs">
            {order.items?.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800">{it.product.name}</p>
                  <p className="text-slate-400">Qty: {it.quantity} × {formatCurrency(it.unitPrice)}</p>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(it.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-right max-w-xs ml-auto">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discounts Applied</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Tax (5%)</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
            <span>Grand Total</span>
            <span className="text-indigo-600">{formatCurrency(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
