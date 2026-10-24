import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, Check, Shield } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    try {
      setUpdatingId(userId);
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      if (res.data?.success) {
        addToast(res.data.message);
        await fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading marketplace user directory..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Account Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Governance over customers, registered sellers, delivery agents, and staff
          </p>
        </div>

        {/* Role Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name / email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-white"
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="VENDOR">Vendors</option>
            <option value="DELIVERY_PARTNER">Delivery Partners</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      <Table headers={['User Identity', 'Role', 'Orders / Reviews', 'Status', 'Registered At', 'Security Action']}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {u.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{u.name}</span>
                  <span className="text-[11px] text-slate-400">{u.email}</span>
                </div>
              </div>
            </td>

            <td className="px-6 py-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-800">
                {u.role}
              </span>
            </td>

            <td className="px-6 py-4 text-xs text-slate-600">
              <span>{u._count?.orders ?? 0} orders</span> • <span>{u._count?.reviews ?? 0} reviews</span>
            </td>

            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
              </span>
            </td>

            <td className="px-6 py-4 text-xs text-slate-400">
              {formatDate(u.createdAt)}
            </td>

            <td className="px-6 py-4">
              {u.role !== 'ADMIN' && (
                <button
                  onClick={() => handleToggleStatus(u.id)}
                  disabled={updatingId === u.id}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    u.isActive
                      ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {u.isActive ? 'Suspend' : 'Activate'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default AdminUsersPage;
