import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Package,
  AlertTriangle,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export const DeliveryDashboardPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({ totalAssigned: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [completeModalDelivery, setCompleteModalDelivery] = useState(null);
  const [otpInput, setOtpInput] = useState('4492');
  const { addToast } = useToast();

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/orders');
      if (res.data?.success) {
        setDeliveries(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    try {
      setUpdatingId(deliveryId);
      const res = await api.put(`/delivery/orders/${deliveryId}/status`, {
        status: newStatus,
      });

      if (res.data?.success) {
        addToast(`Delivery status updated to ${newStatus}`);
        await fetchDeliveries();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteHandover = async (e) => {
    e.preventDefault();
    if (!completeModalDelivery) return;
    try {
      setUpdatingId(completeModalDelivery.id);
      const res = await api.put(`/delivery/orders/${completeModalDelivery.id}/status`, {
        status: 'DELIVERED',
        notes: `Handover verified with Customer OTP (${otpInput})`,
      });

      if (res.data?.success) {
        addToast('Order marked as successfully delivered! COD payment settled if applicable.');
        setCompleteModalDelivery(null);
        await fetchDeliveries();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Connecting to delivery dispatcher..." />;

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Assigned</span>
          <span className="text-2xl font-black text-slate-900">{stats.totalAssigned}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Active In-Flight</span>
          <span className="text-2xl font-black text-indigo-600">{stats.active}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">Completed</span>
          <span className="text-2xl font-black text-emerald-600">{stats.completed}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Your Delivery Assignments</h2>
        <Button variant="outline" size="sm" onClick={fetchDeliveries} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {deliveries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
          No delivery assignments currently queued.
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((d) => {
            const o = d.order;
            const isDelivered = d.status === 'DELIVERED';
            const isCOD = o?.payment?.method === 'COD';

            return (
              <div
                key={d.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs space-y-4 transition-all ${
                  isDelivered ? 'border-slate-200/60 opacity-80' : 'border-indigo-200 shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">#{o?.orderNumber}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(d.createdAt)}</span>
                </div>

                {/* Customer & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Recipient</span>
                    <p className="font-bold text-slate-900 text-sm">{o?.shippingAddress?.fullName}</p>
                    <a
                      href={`tel:${o?.shippingAddress?.phone}`}
                      className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {o?.shippingAddress?.phone || 'No phone'}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Delivery Address</span>
                    <p className="text-slate-700 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{o?.shippingAddress?.address}, {o?.shippingAddress?.city} ({o?.shippingAddress?.postalCode})</span>
                    </p>
                  </div>
                </div>

                {/* Items & Payment Amount */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Order Value: <strong>{formatCurrency(o?.grandTotal)}</strong></span>
                    <span className={`font-bold inline-block mt-0.5 ${isCOD ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {isCOD ? '💵 Cash on Delivery (Collect on delivery)' : '💳 Prepaid Online (No Cash to Collect)'}
                    </span>
                  </div>

                  {/* Progressive Delivery Action Button */}
                  <div className="flex items-center gap-2">
                    {d.status === 'ASSIGNED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(d.id, 'PICKED_UP')}
                        loading={updatingId === d.id}
                        icon={Package}
                      >
                        Pickup Package from Seller
                      </Button>
                    )}

                    {d.status === 'PICKED_UP' && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleUpdateStatus(d.id, 'OUT_FOR_DELIVERY')}
                        loading={updatingId === d.id}
                        icon={Truck}
                      >
                        Start Delivery Route
                      </Button>
                    )}

                    {d.status === 'OUT_FOR_DELIVERY' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCompleteModalDelivery(d)}
                        loading={updatingId === d.id}
                        icon={CheckCircle2}
                      >
                        Confirm Doorstep Delivery
                      </Button>
                    )}

                    {isDelivered && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Delivered & Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Handover Modal */}
      <Modal
        isOpen={!!completeModalDelivery}
        onClose={() => setCompleteModalDelivery(null)}
        title="Complete Package Handover"
      >
        <form onSubmit={handleCompleteHandover} className="space-y-4">
          <p className="text-xs text-slate-600">
            Verify handover with the customer. Enter the simulation OTP below to record milestone completion:
          </p>
          <Input
            label="Customer Verification OTP"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setCompleteModalDelivery(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={updatingId === completeModalDelivery?.id}>
              Confirm Delivery
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DeliveryDashboardPage;
