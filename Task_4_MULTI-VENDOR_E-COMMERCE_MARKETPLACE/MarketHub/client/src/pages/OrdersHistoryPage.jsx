import React, { useState, useEffect } from 'react';
import { Package, Search } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import Button from '../components/Button';

export const OrdersHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
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
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    try {
      setCancelling(true);
      const res = await api.put(`/orders/${cancelModalOrder}/cancel`);
      if (res.data?.success) {
        addToast('Order cancelled successfully.');
        setCancelModalOrder(null);
        await fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    try {
      setSubmittingReturn(true);
      const res = await api.put(`/orders/${returnModalOrder}/return`, {
        reason: returnReason,
      });
      if (res.data?.success) {
        addToast('Return request submitted for admin review.');
        setReturnModalOrder(null);
        setReturnReason('');
        await fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading your orders..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Order History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, track, and manage all your past multi-vendor purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Placed Yet"
          description="You haven't placed any marketplace orders. Explore products from our certified vendors!"
          actionLabel="Explore Catalog"
          onAction={() => window.location.href = '/products'}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={(id) => setCancelModalOrder(id)}
              onReturn={(id) => setReturnModalOrder(id)}
            />
          ))}
        </div>
      )}

      {/* Cancel Order Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? Stock will be immediately restored to the seller and any paid funds will be refunded."
        confirmLabel="Yes, Cancel Order"
      />

      {/* Return Request Modal */}
      <Modal
        isOpen={!!returnModalOrder}
        onClose={() => setReturnModalOrder(null)}
        title="Request Return"
      >
        <form onSubmit={handleConfirmReturn} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please let us know why you would like to return items from this order. Our marketplace team will review your request within 24 hours.
          </p>
          <textarea
            rows={3}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="e.g. Size didn't fit, item damaged in transit, wrong color..."
            className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReturnModalOrder(null)}>
              Close
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submittingReturn}>
              Submit Return Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersHistoryPage;
