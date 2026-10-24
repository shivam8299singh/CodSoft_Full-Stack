import { CalendarCheck, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { reservationService } from '../../services/reservationService';
import { RESERVATION_STATUS_LABELS } from '../../utils/constants';

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const toast = useToast();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getReservations({
        status: statusFilter,
        date: dateFilter || undefined,
      });
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, dateFilter]);

  const handleStatusChange = async (resvId, newStatus) => {
    try {
      await reservationService.updateReservationStatus(resvId, newStatus);
      toast.success(`Reservation status changed to ${newStatus}`);
      fetchReservations();
    } catch (err) {
      toast.error(err.message || 'Failed to update reservation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Reservations Master Control</h1>
          <p className="text-xs text-slate-500">Oversee all customer table bookings, confirmations, and attendance</p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchReservations} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Reservations Table */}
      {loading ? (
        <LoadingSpinner text="Fetching reservations ledger..." />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No reservations found"
          description="Try selecting a different date or status filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Guest</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Party Size</th>
                  <th className="px-5 py-3.5">Table</th>
                  <th className="px-5 py-3.5">Requests</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((resv) => {
                  const statusInfo = RESERVATION_STATUS_LABELS[resv.status] || {
                    label: resv.status,
                    color: 'bg-slate-100 text-slate-800',
                  };

                  return (
                    <tr key={resv.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{resv.customerName}</p>
                        <p className="text-slate-400 text-[11px]">{resv.customerPhone}</p>
                        <p className="text-slate-400 text-[11px]">{resv.customerEmail}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">
                          {new Date(resv.reservationDate).toLocaleDateString()}
                        </p>
                        <p className="text-amber-600 font-bold text-[11px]">
                          {resv.reservationTime}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {resv.guestsCount} Guests
                      </td>
                      <td className="px-5 py-4">
                        {resv.table ? (
                          <span className="font-bold text-slate-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            Table #{resv.table.tableNumber} ({resv.table.location})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-xs text-slate-500 italic">
                        {resv.specialRequest || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={resv.status}
                          onChange={(e) => handleStatusChange(resv.id, e.target.value)}
                          className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-xs cursor-pointer focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationsPage;
