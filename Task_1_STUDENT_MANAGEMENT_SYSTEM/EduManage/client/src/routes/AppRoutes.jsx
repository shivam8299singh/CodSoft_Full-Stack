import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentsList from '../pages/admin/StudentsList';
import StudentProfilePage from '../pages/admin/StudentProfilePage';
import TeachersList from '../pages/admin/TeachersList';
import CoursesPage from '../pages/admin/CoursesPage';
import AdminAttendance from '../pages/admin/AdminAttendance';
import AdminExams from '../pages/admin/AdminExams';
import AdminFees from '../pages/admin/AdminFees';
import AdminAcademicRecords from '../pages/admin/AdminAcademicRecords';
import AdminSettings from '../pages/admin/AdminSettings';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherSubjects from '../pages/teacher/TeacherSubjects';
import TeacherAttendance from '../pages/teacher/TeacherAttendance';
import TeacherExams from '../pages/teacher/TeacherExams';
import TeacherProfile from '../pages/teacher/TeacherProfile';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import StudentAttendance from '../pages/student/StudentAttendance';
import StudentExams from '../pages/student/StudentExams';
import StudentResults from '../pages/student/StudentResults';
import StudentTranscript from '../pages/student/StudentTranscript';
import StudentFees from '../pages/student/StudentFees';

const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Redirection */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin Module Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentsList />} />
        <Route path="students/:id" element={<StudentProfilePage />} />
        <Route path="teachers" element={<TeachersList />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="exams" element={<AdminExams />} />
        <Route path="fees" element={<AdminFees />} />
        <Route path="records" element={<AdminAcademicRecords />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Teacher Module Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="subjects" element={<TeacherSubjects />} />
        <Route path="students" element={<StudentsList />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="exams" element={<TeacherExams />} />
      </Route>

      {/* Student Module Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="records" element={<StudentTranscript />} />
        <Route path="fees" element={<StudentFees />} />
      </Route>

      {/* Catch-all Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
