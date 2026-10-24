export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const ORDER_STATUS_LABELS = {
  PLACED: { label: 'Placed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' },
  READY: { label: 'Ready', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const RESERVATION_STATUS_LABELS = {
  PENDING: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  COMPLETED: { label: 'Completed', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const TABLE_STATUS_LABELS = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RESERVED: { label: 'Reserved', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  OCCUPIED: { label: 'Occupied', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  CLEANING: { label: 'Cleaning', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const ROLE_REDIRECTS = {
  ADMIN: '/admin',
  STAFF: '/staff',
  KITCHEN: '/kitchen',
  CUSTOMER: '/customer',
};
