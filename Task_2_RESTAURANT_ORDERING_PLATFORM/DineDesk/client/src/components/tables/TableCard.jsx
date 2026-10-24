import { CheckCircle, Clock, Sparkles, Users, Utensils } from 'lucide-react';
import React from 'react';
import { TABLE_STATUS_LABELS } from '../../utils/constants';

const TableCard = ({ table, onStatusChange, canManage = false }) => {
  const statusInfo = TABLE_STATUS_LABELS[table.status] || {
    label: table.status,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const getStatusBorder = () => {
    switch (table.status) {
      case 'AVAILABLE':
        return 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/20';
      case 'RESERVED':
        return 'border-blue-200 hover:border-blue-400 bg-blue-50/20';
      case 'OCCUPIED':
        return 'border-amber-200 hover:border-amber-400 bg-amber-50/20';
      case 'CLEANING':
        return 'border-purple-200 hover:border-purple-400 bg-purple-50/20';
      default:
        return 'border-slate-200';
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 border shadow-xs transition-all duration-200 flex flex-col justify-between ${getStatusBorder()}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
            {table.location}
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-800 font-serif font-bold text-xl">
            {table.tableNumber}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">Table #{table.tableNumber}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{table.capacity} Guests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Status Control */}
      {canManage && (
        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-500">Change:</span>
          <select
            value={table.status}
            onChange={(e) => onStatusChange && onStatusChange(table.id, e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-xs focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="CLEANING">Cleaning</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default TableCard;
