import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, Mail, Lock, ShieldCheck, UserCheck, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both your institutional email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      showToast(`Welcome back, ${result.user.email}!`, 'success');
      // Redirect based on role
      const role = result.user.role;
      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'TEACHER') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setErrorMessage(result.message);
      showToast(result.message, 'error');
    }
  };

  // Demo auto-fill helper
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStatus(res.data.message);
      showToast('Instructions sent to your email', 'info');
    } catch (err) {
      setForgotStatus('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">EduManage</h2>
        <p className="mt-1 text-sm text-slate-400">Institutional Student Management System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="e.g. admin@edumanage.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mr-2"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotStatus(null);
                  setForgotEmail(email);
                  setForgotModalOpen(true);
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isLoading}
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Quick Demo Access Box */}
          <div className="mt-7 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@edumanage.com', 'admin123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all text-center flex flex-col items-center justify-center space-y-1 group"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('teacher@edumanage.com', 'teacher123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all text-center flex flex-col items-center justify-center space-y-1 group"
              >
                <BookOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('student@edumanage.com', 'student123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all text-center flex flex-col items-center justify-center space-y-1 group"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Student</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Click any role above to automatically populate test credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Account Password"
        description="Enter your registered academic email address to receive password reset instructions."
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. your.email@edumanage.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
          {forgotStatus && (
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs border border-indigo-200">
              {forgotStatus}
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" onClick={() => setForgotModalOpen(false)}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              Send Instructions
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
