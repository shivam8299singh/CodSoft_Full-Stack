import React from 'react';
import { getOrderStatusColor } from '../utils/formatters';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const colorClass = getOrderStatusColor(status);
  const formattedText = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border uppercase ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {formattedText}
    </span>
  );
};

export default StatusBadge;
