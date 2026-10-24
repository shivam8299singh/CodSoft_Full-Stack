export const formatCurrency = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getOrderStatusColor = (status) => {
  switch (status) {
    case 'PLACED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CONFIRMED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'PROCESSING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'SHIPPED':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'OUT_FOR_DELIVERY':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'RETURN_REQUESTED':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'REFUNDED':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};
