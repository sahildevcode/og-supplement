import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/AdminToastContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Components & Layout
import AdminLayout from './components/AdminLayout';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminStock from './pages/AdminStock';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminAuthProvider>
          <Router>
            <Routes>
              
              {/* Standalone Admin Login */}
              <Route path="/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="stock" element={<AdminStock />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
              </Route>

              {/* Catch-All */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
          </Router>
        </AdminAuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
