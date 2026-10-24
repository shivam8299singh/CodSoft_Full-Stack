import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  CreditCard,
  Award,
  Settings,
  LogOut,
  UserCheck,
  FileText,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (role === 'ADMIN') {
      return [
        { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Students', to: '/admin/students', icon: Users },
        { label: 'Teachers', to: '/admin/teachers', icon: GraduationCap },
        { label: 'Courses & Subjects', to: '/admin/courses', icon: BookOpen },
        { label: 'Attendance', to: '/admin/attendance', icon: CalendarCheck },
        { label: 'Examinations', to: '/admin/exams', icon: FileSpreadsheet },
        { label: 'Fee Management', to: '/admin/fees', icon: CreditCard },
        { label: 'Academic Records', to: '/admin/records', icon: Award },
        { label: 'Settings', to: '/admin/settings', icon: Settings },
      ];
    } else if (role === 'TEACHER') {
      return [
        { label: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', to: '/teacher/profile', icon: UserCheck },
        { label: 'My Subjects', to: '/teacher/subjects', icon: BookOpen },
        { label: 'Students', to: '/teacher/students', icon: Users },
        { label: 'Attendance', to: '/teacher/attendance', icon: CalendarCheck },
        { label: 'Examinations', to: '/teacher/exams', icon: FileSpreadsheet },
      ];
    } else {
      // STUDENT
      return [
        { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', to: '/student/profile', icon: UserCheck },
        { label: 'Attendance', to: '/student/attendance', icon: CalendarCheck },
        { label: 'Examinations', to: '/student/exams', icon: FileSpreadsheet },
        { label: 'Results', to: '/student/results', icon: FileText },
        { label: 'Academic Records', to: '/student/records', icon: Award },
        { label: 'Fees', to: '/student/fees', icon: CreditCard },
      ];
    }
  };

  const links = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">Edu<span className="text-indigo-400">Manage</span></span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Institutional Portal</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-300">
              {user?.adminProfile?.fullName?.[0] || user?.teacher?.fullName?.[0] || user?.student?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.adminProfile?.fullName || user?.teacher?.fullName || user?.student?.fullName || user?.email}
              </p>
              <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 transition-all duration-150 border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
