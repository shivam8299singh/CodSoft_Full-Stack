import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleReturn = () => {
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'TEACHER') navigate('/teacher/dashboard');
    else if (role === 'STUDENT') navigate('/student/dashboard');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6 shadow-sm">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">403 — Access Restricted</h1>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-8">
        You do not have the required security credentials or institutional role to view this module.
      </p>
      <Button
        variant="primary"
        icon={ArrowLeft}
        onClick={handleReturn}
      >
        Return to My Dashboard
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
