import {
  CalendarCheck,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { reservationService } from '../../services/reservationService';
import { RESERVATION_STATUS_LABELS } from '../../utils/constants';

const CustomerReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const toast = useToast();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelReservation = async () => {
    if (!cancellingId) return;
    try {
      await reservationService.cancelMyReservation(cancellingId);
      toast.success('Reservation cancelled successfully');
      setIsConfirmOpen(false);
      fetchReservations();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel reservation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Your Table Bookings</h2>
          <p className="text-xs text-slate-500">Upcoming and past table reservations at DineDesk</p>
        </div>

        <Link to="/reservations">
          <Button size="sm">Book New Table</Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching reservations..." />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No reservations found"
          description="You haven't reserved any tables yet. Plan your next dining experience now."
          actionText="Reserve a Table"
          onAction={() => window.location.assign('/reservations')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((resv) => {
            const statusInfo = RESERVATION_STATUS_LABELS[resv.status] || {
              label: resv.status,
              color: 'bg-slate-100 text-slate-800',
            };

            const isUpcoming = resv.status === 'PENDING' || resv.status === 'CONFIRMED';

            return (
              <div
                key={resv.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-amber-300 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-slate-400">
                      REF #{resv.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg font-serif text-slate-900">
                    {new Date(resv.reservationDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-slate-800">
                        {resv.reservationTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>{resv.guestsCount} Guests</span>
                    </div>

                    {resv.table && (
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                        <span>
                          Table #{resv.table.tableNumber} • {resv.table.location}
                        </span>
                      </div>
                    )}

                    {resv.specialRequest && (
                      <p className="pt-2 text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{resv.specialRequest}"
                      </p>
                    )}
                  </div>
                </div>

                {isUpcoming && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => {
                        setCancellingId(resv.id);
                        setIsConfirmOpen(true);
                      }}
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleCancelReservation}
        title="Cancel Table Reservation?"
        message="Are you sure you want to cancel this reservation? The reserved table will be released for other dining guests."
        confirmText="Yes, Cancel Booking"
        isDanger={true}
      />
    </div>
  );
};

export default CustomerReservationsPage;
