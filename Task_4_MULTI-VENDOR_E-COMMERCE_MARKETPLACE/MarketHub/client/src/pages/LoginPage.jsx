import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ShoppingBag, ShieldCheck, Store, Truck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }
    try {
      setLoading(true);
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`);

      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'VENDOR') navigate('/vendor/dashboard');
      else if (user.role === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
      else navigate(from);
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Market<span className="text-indigo-600">Hub</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">Access your personalized marketplace dashboard</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10 space-y-6">
          {/* Quick Demo Switcher Cards */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Instant Demo Fill (CodSoft Evaluator Shortcuts):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer@markethub.com', 'Customer@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100/60 text-indigo-700 font-semibold transition-colors text-left"
              >
                <User className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">Customer</span>
                  <span className="text-[10px] opacity-75">customer@markethub</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('vendor@markethub.com', 'Vendor@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-100 bg-amber-50/60 hover:bg-amber-100/60 text-amber-800 font-semibold transition-colors text-left"
              >
                <Store className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">Vendor</span>
                  <span className="text-[10px] opacity-75">vendor@markethub</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('delivery@markethub.com', 'Delivery@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-cyan-100 bg-cyan-50/60 hover:bg-cyan-100/60 text-cyan-800 font-semibold transition-colors text-left"
              >
                <Truck className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">Delivery</span>
                  <span className="text-[10px] opacity-75">delivery@markethub</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@markethub.com', 'Admin@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-100 bg-rose-50/60 hover:bg-rose-100/60 text-rose-800 font-semibold transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">Admin</span>
                  <span className="text-[10px] opacity-75">admin@markethub</span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or enter credentials</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              placeholder="you@domain.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={LogIn}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
