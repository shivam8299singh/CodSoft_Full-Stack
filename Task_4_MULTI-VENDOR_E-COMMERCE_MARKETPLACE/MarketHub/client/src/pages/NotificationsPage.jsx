import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Package, Store, Truck, Info, DollarSign } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-5 h-5 text-indigo-600" />;
      case 'VENDOR':
        return <Store className="w-5 h-5 text-amber-600" />;
      case 'DELIVERY':
        return <Truck className="w-5 h-5 text-cyan-600" />;
      case 'FINANCE':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your order status, delivery milestones, and marketplace alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Yet"
          description="You are all caught up! Order updates and marketplace alerts will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? 'bg-indigo-50/40 border-indigo-200 shadow-2xs'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0 border border-slate-100">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View Details &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
