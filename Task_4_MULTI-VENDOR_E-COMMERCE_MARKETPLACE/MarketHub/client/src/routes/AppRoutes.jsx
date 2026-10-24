import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import VendorLayout from '../layouts/VendorLayout';
import AdminLayout from '../layouts/AdminLayout';
import DeliveryLayout from '../layouts/DeliveryLayout';

// Customer / Public Pages
import HomePage from '../pages/HomePage';
import ProductCatalogPage from '../pages/ProductCatalogPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import OrdersHistoryPage from '../pages/OrdersHistoryPage';
import ProductComparisonPage from '../pages/ProductComparisonPage';
import WishlistPage from '../pages/WishlistPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Vendor Pages
import VendorDashboardPage from '../pages/vendor/VendorDashboardPage';
import VendorProductsPage from '../pages/vendor/VendorProductsPage';
import VendorInventoryPage from '../pages/vendor/VendorInventoryPage';
import VendorOrdersPage from '../pages/vendor/VendorOrdersPage';
import VendorPromotionsPage from '../pages/vendor/VendorPromotionsPage';
import VendorFinancialsPage from '../pages/vendor/VendorFinancialsPage';
import VendorReviewsPage from '../pages/vendor/VendorReviewsPage';
import VendorProfilePage from '../pages/vendor/VendorProfilePage';

// Delivery Pages
import DeliveryDashboardPage from '../pages/delivery/DeliveryDashboardPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminVendorsPage from '../pages/admin/AdminVendorsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminCommissionsPage from '../pages/admin/AdminCommissionsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public / Customer Storefront Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductCatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/compare" element={<ProductComparisonPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'VENDOR', 'DELIVERY_PARTNER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id/confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id/tracking"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 3. Vendor Dedicated Workspace */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="products" element={<VendorProductsPage />} />
        <Route path="inventory" element={<VendorInventoryPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="promotions" element={<VendorPromotionsPage />} />
        <Route path="financials" element={<VendorFinancialsPage />} />
        <Route path="reviews" element={<VendorReviewsPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
      </Route>

      {/* 4. Delivery Partner Hub */}
      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={['DELIVERY_PARTNER']}>
            <DeliveryLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/delivery/dashboard" replace />} />
        <Route path="dashboard" element={<DeliveryDashboardPage />} />
      </Route>

      {/* 5. Marketplace Admin Console */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="vendors" element={<AdminVendorsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="commissions" element={<AdminCommissionsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
