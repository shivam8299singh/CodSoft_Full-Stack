import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Store, Truck, ShoppingBag, Mail, Lock, Phone, MapPin, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'CUSTOMER';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Vendor specific
    ownerName: '',
    businessName: '',
    businessAddress: '',
    // Delivery Partner specific
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        ...formData,
        role,
      });

      addToast(`Account created successfully! Welcome to MarketHub, ${user.name}`);

      if (user.role === 'VENDOR') navigate('/vendor/dashboard');
      else if (user.role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Market<span className="text-indigo-600">Hub</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Create an Account</h2>
        <p className="text-xs text-slate-500">Choose your account type to register</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10 space-y-6">
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'CUSTOMER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'VENDOR' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vendor</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('DELIVERY_PARTNER')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'DELIVERY_PARTNER' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Delivery</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common user fields */}
            <Input
              label={role === 'VENDOR' ? 'Owner / Primary Contact Name' : 'Full Name'}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              icon={User}
              placeholder="e.g. John Doe"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                icon={Mail}
                placeholder="you@domain.com"
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                icon={Phone}
                placeholder="+91 98765 00000"
                required
              />
            </div>

            {/* Vendor Specific fields */}
            {role === 'VENDOR' && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Business Information
                </h4>
                <Input
                  label="Registered Business Name"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  icon={Building}
                  placeholder="e.g. Apex Tech Retailers"
                  required
                />
                <Input
                  label="Business Operational Address"
                  value={formData.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  icon={MapPin}
                  placeholder="Plot / Street / City / PIN"
                  required
                />
              </div>
            )}

            {/* Delivery Partner Specific fields */}
            {role === 'DELIVERY_PARTNER' && (
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/60 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-900">
                  Logistics & Vehicle Information
                </h4>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleChange('vehicleType', e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  >
                    <option value="Motorcycle">Motorcycle / Two Wheeler</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Delivery Van">Delivery Cargo Van</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <Input
                  label="Vehicle License Number (Optional)"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleChange('vehicleNumber', e.target.value)}
                  placeholder="e.g. KA-01-AB-1234"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                icon={Lock}
                placeholder="••••••••"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                icon={Lock}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-4"
            >
              Register as {role.replace(/_/g, ' ')}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
