import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

// Layouts & Drawers
import CartDrawer from '../components/cart/CartDrawer';
import CustomerLayout from '../components/layout/CustomerLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Public Pages
import AboutPage from '../pages/public/AboutPage';
import CartPage from '../pages/public/CartPage';
import CheckoutPage from '../pages/public/CheckoutPage';
import HomePage from '../pages/public/HomePage';
import MenuPage from '../pages/public/MenuPage';
import OrderTrackPage from '../pages/public/OrderTrackPage';
import ReservationPage from '../pages/public/ReservationPage';

// Customer Pages
import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage';
import CustomerOrdersPage from '../pages/customer/CustomerOrdersPage';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';
import CustomerReservationsPage from '../pages/customer/CustomerReservationsPage';

// Kitchen Pages
import KitchenDashboardPage from '../pages/kitchen/KitchenDashboardPage';

// Staff Pages
import StaffCustomersPage from '../pages/staff/StaffCustomersPage';
import StaffDashboardPage from '../pages/staff/StaffDashboardPage';
import StaffOrdersPage from '../pages/staff/StaffOrdersPage';
import StaffReservationsPage from '../pages/staff/StaffReservationsPage';
import StaffTablesPage from '../pages/staff/StaffTablesPage';

// Admin Pages
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminMenuPage from '../pages/admin/AdminMenuPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import AdminReservationsPage from '../pages/admin/AdminReservationsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminTablesPage from '../pages/admin/AdminTablesPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';

import NotFoundPage from '../pages/NotFoundPage';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';

// Public Layout Wrapper with sticky Navbar and Footer
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/track" element={<OrderTrackPage />} />
        <Route path="/track/:orderNumber" element={<OrderTrackPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Customer Portal Routes */}
      <Route
        path="/customer"
        element={
          <RoleRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
            <CustomerLayout />
          </RoleRoute>
        }
      >
        <Route index element={<CustomerDashboardPage />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="reservations" element={<CustomerReservationsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* 3. Kitchen KDS Display */}
      <Route
        path="/kitchen"
        element={
          <RoleRoute allowedRoles={['KITCHEN', 'STAFF', 'ADMIN']}>
            <KitchenDashboardPage />
          </RoleRoute>
        }
      />

      {/* 4. Staff Portal Routes */}
      <Route
        path="/staff"
        element={
          <RoleRoute allowedRoles={['STAFF', 'ADMIN']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<StaffDashboardPage />} />
        <Route path="orders" element={<StaffOrdersPage />} />
        <Route path="reservations" element={<StaffReservationsPage />} />
        <Route path="tables" element={<StaffTablesPage />} />
        <Route path="customers" element={<StaffCustomersPage />} />
      </Route>

      {/* 5. Admin Control Center Routes */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="menu" element={<AdminMenuPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="tables" element={<AdminTablesPage />} />
        <Route path="reservations" element={<AdminReservationsPage />} />
        <Route path="customers" element={<StaffCustomersPage />} />
        <Route path="staff" element={<AdminUsersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 6. Fallback */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
