import {
  Lock,
  Mail,
  Phone,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch('password');

  const handleRegisterSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await registerAuth({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      toast.success(`Account created! Welcome to DineDesk, ${user.name}!`);
      navigate('/customer');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            Create Customer Account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enjoy personalized ordering, saved reservations, and order history tracking
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl">
          <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Eleanor Vance"
              icon={User}
              {...register('name', { required: 'Full name is required' })}
              error={errors.name?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. eleanor@example.com"
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
              label="Phone Number"
              placeholder="e.g. +91 98765 43210"
              icon={Phone}
              {...register('phone', { required: 'Phone number is required' })}
              error={errors.phone?.message}
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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === passwordValue || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full py-3.5 shadow-lg shadow-amber-600/25 mt-4"
            >
              Register & Start Dining
            </Button>
          </form>
        </div>

        {/* Already have an account */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
