import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';

// Public pages
import Splash from '../pages/Splash';
import PortalSelection from '../pages/PortalSelection';
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import RegistrationSuccess from '../pages/auth/RegistrationSuccess';

// Farmer pages
import FarmerLayout from '../components/layout/FarmerLayout';
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import MySlots from '../pages/farmer/MySlots';
import MyQueue from '../pages/farmer/MyQueue';
import Procurement from '../pages/farmer/Procurement';
import Payments from '../pages/farmer/Payments';
import Profile from '../pages/farmer/Profile';
import Notifications from '../pages/farmer/Notifications';

// Local Admin pages
import LocalAdminLayout from '../components/layout/LocalAdminLayout';
import LocalAdminDashboard from '../pages/local-admin/LocalAdminDashboard';
import QueueManagement from '../pages/local-admin/QueueManagement';
import ProcurementManagement from '../pages/local-admin/ProcurementManagement';
import AdminFarmers from '../pages/local-admin/Farmers';

// Super Admin pages
import SuperAdminLayout from '../components/layout/SuperAdminLayout';
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';
import Centres from '../pages/super-admin/Centres';
import SuperFarmers from '../pages/super-admin/Farmers';
import Analytics from '../pages/super-admin/Analytics';
import Admins from '../pages/super-admin/Admins';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Splash />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/portal" element={<PortalSelection />} />
      <Route path="/landing" element={<Navigate to="/portal" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/super-admin/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />

      {/* Farmer Routes */}
      <Route path="/farmer" element={
        <ProtectedRoute allowedRoles={['farmer']}>
          <FarmerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<FarmerDashboard />} />
        <Route path="slots" element={<MySlots />} />
        <Route path="queue" element={<MyQueue />} />
        <Route path="procurement" element={<Procurement />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Local Admin Routes - Direct Procurement Centre Admin Workspace */}
      <Route path="/local-admin" element={<LocalAdminLayout />}>
        <Route index element={<LocalAdminDashboard />} />
        <Route path="queue" element={<QueueManagement />} />
        <Route path="procurement" element={<ProcurementManagement />} />
        <Route path="farmers" element={<AdminFarmers />} />
      </Route>

      {/* Super Admin Routes */}
      <Route path="/super-admin" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="centres" element={<Centres />} />
        <Route path="farmers" element={<SuperFarmers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="admins" element={<Admins />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
