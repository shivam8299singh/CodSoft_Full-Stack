import { Building, Clock, Mail, MapPin, Percent, Phone, Save, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { settingService } from '../../services/settingService';

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingService.getSettings();
        reset(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (formData) => {
    setIsSaving(true);
    try {
      await settingService.updateSettings(formData);
      toast.success('Restaurant settings updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading restaurant configuration..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-serif text-slate-900">Restaurant Settings</h1>
        <p className="text-xs text-slate-500">Configure global restaurant identity, tax rates, delivery tariffs, and operating schedule</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identity */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Restaurant Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Restaurant Name"
                icon={Building}
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
              />
              <Input
                label="Tagline / Motto"
                {...register('tagline')}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Contact & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Email"
                type="email"
                icon={Mail}
                {...register('email', { required: 'Email is required' })}
              />
              <Input
                label="Phone Number"
                icon={Phone}
                {...register('phone', { required: 'Phone is required' })}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Restaurant Address"
                icon={MapPin}
                {...register('address', { required: 'Address is required' })}
              />
            </div>
          </div>

          {/* Tariffs & Hours */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Tariffs & Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="GST Tax Rate (%)"
                type="number"
                step="0.1"
                icon={Percent}
                {...register('taxRate', { required: 'Tax rate is required' })}
              />

              <Input
                label="Flat Delivery Fee (₹)"
                type="number"
                step="1"
                {...register('deliveryFee', { required: 'Delivery fee is required' })}
              />

              <Input
                label="Operating Hours"
                icon={Clock}
                {...register('openingHours', { required: 'Hours are required' })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" isLoading={isSaving} icon={Save}>
              Save Restaurant Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
