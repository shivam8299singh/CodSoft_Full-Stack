import { Lock, Mail, Phone, Plus, ShieldCheck, Trash2, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'STAFF',
    },
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search,
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleOpenAdd = () => {
    reset({ name: '', email: '', phone: '', password: '', role: 'STAFF' });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await userService.createStaffUser(formData);
      toast.success(`Created new ${formData.role} account!`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to change role');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await userService.deleteUser(deletingId);
      toast.success('User account removed');
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">User & Staff Management</h1>
          <p className="text-xs text-slate-500">Manage floor staff, kitchen team, and dining customer accounts</p>
        </div>

        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Staff / Kitchen User
        </Button>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'ADMIN', 'STAFF', 'KITCHEN', 'CUSTOMER'].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              roleFilter === role
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {role === 'all' ? 'All User Accounts' : `${role}s`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Fetching user directory..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try selecting another role filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">System Role</th>
                  <th className="px-5 py-3.5">Created At</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{u.email}</td>
                    <td className="px-5 py-4 text-slate-500">{u.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700 shadow-xs cursor-pointer focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="KITCHEN">Kitchen</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setDeletingId(u.id);
                          setIsConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-400 transition"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff or Kitchen Member"
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Marcus Vance"
            icon={User}
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. marcus.chef@dinedesk.com"
            icon={Mail}
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +91 98765 00000"
            icon={Phone}
            {...register('phone')}
          />

          <Input
            label="Default Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            error={errors.password?.message}
          />

          <Select label="Role Assignment" {...register('role')}>
            <option value="STAFF">Restaurant Staff (Floor & Orders)</option>
            <option value="KITCHEN">Kitchen Staff (KDS Preparation)</option>
            <option value="ADMIN">Administrator (Full Access)</option>
          </Select>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete User Account?"
        message="Are you sure you want to remove this account? This action cannot be reversed."
        confirmText="Yes, Delete User"
        isDanger={true}
      />
    </div>
  );
};

export default AdminUsersPage;
