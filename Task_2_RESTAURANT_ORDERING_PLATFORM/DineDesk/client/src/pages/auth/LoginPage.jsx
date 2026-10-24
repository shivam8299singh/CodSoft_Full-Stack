import {
  ChefHat,
  Crown,
  KeyRound,
  Lock,
  Mail,
  ShoppingBag,
  Sparkles,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLE_REDIRECTS } from '../../utils/constants';

const DEMO_LOGINS = [
  { role: 'ADMIN', label: 'Admin', email: 'admin@dinedesk.com', password: 'admin123', icon: Crown },
  { role: 'STAFF', label: 'Staff', email: 'staff@dinedesk.com', password: 'staff123', icon: Users },
  { role: 'KITCHEN', label: 'Kitchen Chef', email: 'kitchen@dinedesk.com', password: 'kitchen123', icon: ChefHat },
  { role: 'CUSTOMER', label: 'Customer', email: 'customer@dinedesk.com', password: 'customer123', icon: ShoppingBag },
];

const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);

      // Determine redirect path
      const redirectPath =
        location.state?.from?.pathname || ROLE_REDIRECTS[user.role] || '/customer';

      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (demo) => {
    setValue('email', demo.email);
    setValue('password', demo.password);
    toast.info(`Filled credentials for ${demo.label}`);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30 group-hover:scale-105 transition">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold font-serif text-slate-900 tracking-tight">
              Dine<span className="text-amber-600">Desk</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold font-serif text-slate-900">
            Sign In to Your Account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access your dining orders, reservations, or management dashboard
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
          <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. admin@dinedesk.com"
              icon={Mail}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full py-3.5 shadow-lg shadow-amber-600/25 mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Login
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_LOGINS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => fillDemoCredentials(demo)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition flex items-center gap-2 group cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700 truncate">
                        {demo.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">Fill demo</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-amber-600 hover:underline">
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
