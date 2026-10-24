import { Mail, Phone, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';

const StaffCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await userService.getCustomersWithStats();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Customer Directory</h1>
          <p className="text-xs text-slate-500">View customer dining frequency and lifetime spending</p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchCustomers} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading customer profiles..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="Registered guests will appear here as they order or reserve tables."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Total Orders</th>
                  <th className="px-5 py-3.5">Reservations</th>
                  <th className="px-5 py-3.5">Lifetime Spend</th>
                  <th className="px-5 py-3.5">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-bold text-slate-800 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-800 font-semibold">{c.email}</p>
                      <p className="text-slate-400 text-[11px]">{c.phone || 'No phone recorded'}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {c.totalOrders} Orders
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {c.reservationsCount} Bookings
                    </td>
                    <td className="px-5 py-4 font-extrabold text-amber-600 font-sans">
                      ₹{c.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(c.memberSince).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCustomersPage;
