import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  User,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reservationService } from '../../services/reservationService';
import { tableService } from '../../services/tableService';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
];

const ReservationPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      guestsCount: 2,
      reservationDate: todayStr,
      reservationTime: '07:30 PM',
      location: 'Indoor',
      specialRequest: '',
    },
  });

  const selectedGuests = watch('guestsCount');
  const selectedLocation = watch('location');

  // Fetch available tables matching criteria
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tables = await tableService.getTables({
          status: 'AVAILABLE',
          location: selectedLocation,
          minCapacity: selectedGuests,
        });
        setAvailableTables(tables);
      } catch (err) {
        console.error('Failed to load tables:', err);
      }
    };

    fetchTables();
  }, [selectedGuests, selectedLocation]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        guestsCount: parseInt(data.guestsCount, 10),
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        specialRequest: data.specialRequest,
        tableId: selectedTable ? selectedTable.id : undefined,
      };

      const res = await reservationService.createReservation(payload);
      setConfirmedReservation(res);
      toast.success('Your table reservation has been requested successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
          Tableside Hospitality
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 mt-2">
          Reserve a Fine Table
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Experience gourmet culinary indulgence. Select your date, preferred dining hall, and let us prepare for your arrival.
        </p>
      </div>

      {confirmedReservation ? (
        /* Confirmation Success Card */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Reservation Requested
            </span>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mt-1">
              We Look Forward to Welcoming You!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Your reservation has been recorded and assigned reference{' '}
              <span className="font-bold text-slate-900">
                #{confirmedReservation.id.substring(0, 8).toUpperCase()}
              </span>
              . Our staff will prepare your table.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="font-medium text-slate-400">Guest Name</span>
              <span className="font-bold text-slate-800">{confirmedReservation.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-400">Date & Time</span>
              <span className="font-bold text-slate-800">
                {new Date(confirmedReservation.reservationDate).toLocaleDateString()} at{' '}
                {confirmedReservation.reservationTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-400">Party Size</span>
              <span className="font-bold text-slate-800">
                {confirmedReservation.guestsCount} Guests
              </span>
            </div>
            {confirmedReservation.table && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Assigned Table</span>
                <span className="font-bold text-amber-600">
                  Table #{confirmedReservation.table.tableNumber} (
                  {confirmedReservation.table.location})
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmedReservation(null)}
            >
              Book Another Table
            </Button>
            {user && (
              <Link to="/customer/reservations">
                <Button size="sm">View My Reservations</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Reservation Booking Form */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Date & Party Size */}
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-sans font-bold flex items-center justify-center">
                  1
                </span>
                Date, Time & Dining Atmosphere
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label="Reservation Date"
                  type="date"
                  min={todayStr}
                  {...register('reservationDate', { required: 'Date is required' })}
                  error={errors.reservationDate?.message}
                />

                <Select
                  label="Preferred Time Slot"
                  {...register('reservationTime', { required: 'Time slot is required' })}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Guests / Party Size"
                  {...register('guestsCount', { required: 'Guests count is required' })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Location Atmosphere Toggle */}
              <div className="mt-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Seating Ambiance
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Indoor', 'Patio', 'Rooftop', 'VIP'].map((loc) => {
                    const isChecked = selectedLocation === loc;
                    return (
                      <label
                        key={loc}
                        className={`flex items-center justify-center p-3 rounded-2xl border text-xs font-bold cursor-pointer transition ${
                          isChecked
                            ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={loc}
                          {...register('location')}
                          className="sr-only"
                        />
                        {loc} Ambiance
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Interactive Table Selection (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-sans font-bold flex items-center justify-center">
                    2
                  </span>
                  Choose Your Table (Optional)
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {availableTables.length} tables available
                </span>
              </div>

              {availableTables.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  No dedicated tables found for {selectedGuests} guests in {selectedLocation}. Our staff will automatically allocate the most comfortable available table for your party!
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableTables.map((t) => {
                    const isSelected = selectedTable?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTable(isSelected ? null : t)}
                        className={`p-4 rounded-2xl border cursor-pointer transition text-center ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25'
                            : 'bg-slate-50 border-slate-200 hover:border-amber-400 text-slate-800'
                        }`}
                      >
                        <UtensilsCrossed className="w-5 h-5 mx-auto mb-1 opacity-80" />
                        <h4 className="font-bold text-sm">Table #{t.tableNumber}</h4>
                        <p className={`text-[11px] ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                          Up to {t.capacity} seats • {t.location}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Guest Contact Details */}
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-sans font-bold flex items-center justify-center">
                  3
                </span>
                Primary Guest Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label="Full Name"
                  placeholder="e.g. Alexander Hamilton"
                  {...register('customerName', { required: 'Full name is required' })}
                  error={errors.customerName?.message}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. alex@example.com"
                  {...register('customerEmail', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  error={errors.customerEmail?.message}
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g. +91 98765 43210"
                  {...register('customerPhone', { required: 'Phone number is required' })}
                  error={errors.customerPhone?.message}
                />
              </div>

              <div className="mt-5">
                <Input
                  label="Special Occasion or Dining Preferences (Optional)"
                  placeholder="e.g. Anniversary dinner, anniversary cake requested, high chair needed"
                  {...register('specialRequest')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                * Confirmation is instant and managed by our floor staff.
              </p>
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="px-8 shadow-xl shadow-amber-600/30"
              >
                Confirm Table Reservation
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
