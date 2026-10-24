import { KeyRound, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CustomerProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
      };

      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      await updateProfile(payload);
      toast.success('Your profile details have been updated!');
      reset({
        name: data.name,
        phone: data.phone,
        currentPassword: '',
        newPassword: '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold font-serif text-slate-900">Personal Information</h2>
        <p className="text-xs text-slate-500">Update your contact information and security settings</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            icon={User}
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address (Read Only)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400">Account emails cannot be changed.</p>
          </div>

          <Input
            label="Phone Number"
            icon={Phone}
            {...register('phone')}
          />

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Change Password (Optional)
            </h4>

            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              {...register('currentPassword')}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              {...register('newPassword', {
                minLength: { value: 6, message: 'New password must be at least 6 characters' },
              })}
              error={errors.newPassword?.message}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={isUpdating}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
