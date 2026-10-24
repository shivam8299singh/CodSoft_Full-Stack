import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  MapPin,
  ChevronLeft,
  Calendar,
  Phone
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export const OrderTrackingPage = () => {
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

  if (loading) return <LoadingSpinner fullScreen text="Loading live tracking..." />;
  if (!order) return <div className="text-center py-20">Order not found.</div>;

  const trackingSteps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received & routed to vendors' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Payment authorized & verified' },
    { key: 'PROCESSING', label: 'Processing', desc: 'Packed by vendor warehouses' },
    { key: 'SHIPPED', label: 'Shipped', desc: 'Dispatched with logistics carrier' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'With local courier partner' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over at doorstep' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Return link */}
      <div>
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order #{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Amount</span>
          <span className="text-xl font-extrabold text-indigo-600">{formatCurrency(order.grandTotal)}</span>
        </div>
      </div>

      {/* Cancelled Notice if applicable */}
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <strong>This order was cancelled.</strong> Any payment made has been processed for refund and stock restored to vendors.
        </div>
      )}

      {/* Visual Tracking Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
          <h3 className="text-base font-bold text-slate-900">Live Delivery Milestones</h3>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
            <div
              className="hidden sm:block absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 relative z-10">
              {trackingSteps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">Assigned Courier Partner</span>
              <p className="font-bold text-indigo-700 text-sm">{order.delivery?.deliveryPartner?.name || 'Local Courier Dispatch'}</p>
              {order.delivery?.deliveryPartner?.phone && (
                <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5" /> {order.delivery.deliveryPartner.phone}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">Delivery Location</span>
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p className="text-slate-500">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items in this order */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Items in this Package</h3>
        <div className="divide-y divide-slate-100">
          {order.items?.map((it) => (
            <div key={it.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={it.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={it.product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{it.product.name}</p>
                  <p className="text-xs text-slate-400">Qty: {it.quantity}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(it.totalPrice)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
