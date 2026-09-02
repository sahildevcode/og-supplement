import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

// Providers
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';

// Customer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Static & Policy Pages
import About from './pages/static/About';
import License from './pages/static/License';
import FAQ from './pages/static/FAQ';
import PrivacyPolicy from './pages/static/PrivacyPolicy';
import Terms from './pages/static/Terms';
import ReturnPolicy from './pages/static/ReturnPolicy';
import ShippingPolicy from './pages/static/ShippingPolicy';
import CancellationPolicy from './pages/static/CancellationPolicy';

// Legacy Hash URL Cleaner (/ # / path -> /path)
function HashCleaner() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.replace(/^#/, '');
      window.history.replaceState(null, '', cleanPath);
      navigate(cleanPath, { replace: true });
    }
  }, [navigate]);

  return null;
}

// Customer Layout Wrapper with Smooth Page Transition
function CustomerLayout() {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 selection:bg-emerald-500 selection:text-black ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />
      <main key={location.pathname} className="flex-1 animate-page-enter">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <HashCleaner />
        <ToastProvider>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <ScrollToTop />
                <Routes>
                  
                  {/* Customer Storefront Clean Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success/:id" element={<OrderSuccess />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Secondary & Policy Pages */}
                    <Route path="/about" element={<About />} />
                    <Route path="/license" element={<License />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                  </Route>

                  {/* 404 Catch-All */}
                  <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
}
