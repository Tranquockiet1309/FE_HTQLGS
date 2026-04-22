import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { ClientLayout } from './components/ClientLayout';
import { Dashboard } from './pages/Dashboard';
import { OrdersList } from './pages/OrdersList';
import { CustomersList } from './pages/CustomersList';
import { ServicesList } from './pages/ServicesList';
import { UsersList } from './pages/UsersList';
import { EditUser } from './pages/EditUser';
import { OrderDetails } from './pages/OrderDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { Inventory } from './pages/Inventory';
import { ClientOrder } from './pages/ClientOrder';
import { Shippers } from './pages/Shippers';
import ShipperDashboard from './pages/ShipperDashboard';
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from 'react-hot-toast';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PaymentReturn } from './pages/PaymentReturn';

function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment-return" element={<PaymentReturn />} />

      {/* Client Routes */}
      <Route
        path="/"
        element={ 
          <ProtectedRoute allowedRoles={["CUSTOMER", "OWNER"]}>
            <ClientLayout isDark={isDark} setIsDark={setIsDark} />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientOrder />} />
      </Route>

      {/* Shipper Routes */}
      <Route
  path="/shipper/delivery"
  element={
    <ProtectedRoute allowedRoles={["SHIPPER"]}>
      <ShipperDashboard />
    </ProtectedRoute>
  }
/>

      {/* Admin Routes */}
      <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["OWNER", "STAFF"]}>
      <AdminLayout isDark={isDark} setIsDark={setIsDark} />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="customers" element={<CustomersList />} />
  <Route path="orders" element={<OrdersList />} />
  <Route path="orders/:id" element={<OrderDetails />} />
  <Route path="reports" element={<AdminDashboard />} />
  <Route path="users" element={<UsersList />} />
  <Route path="users/edit/:id" element={<EditUser />} />
  <Route path="services" element={<ServicesList />} />
  <Route path="shippers" element={<Shippers />} />
  <Route path="inventory" element={<Inventory />} />
  <Route index element={<Navigate to="dashboard" replace />} />
</Route>

      {/* Fallback to Login if not matched (or home) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
