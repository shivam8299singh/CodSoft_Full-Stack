export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PAID':
    case 'PRESENT':
    case 'ACTIVE':
    case 'PASSED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PARTIAL':
    case 'LATE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PENDING':
    case 'ABSENT':
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getGradeColor = (grade) => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'B+':
    case 'B':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'C':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'D':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'F':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};
