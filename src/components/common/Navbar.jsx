import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Clock,
  Sparkles,
  Layers,
  Home,
  LogOut,
  Package,
  Sun,
  Moon,
  Bell,
  ShieldCheck,
  HelpCircle,
  FileText,
  Truck,
  RotateCcw,
  Mail,
  ChevronRight,
  ExternalLink,
  Flame,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { searchQuery, setSearchQuery, setSelectedCategory } = useProducts();
  const { isDark, toggleTheme } = useTheme();

  // Navigation states
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const navigate = useNavigate();
  const location = useLocation();
  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Close drawer and dropdowns on route change
  useEffect(() => {
    setIsSideDrawerOpen(false);
    setIsProfileDropdownOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  // Keyboard Escape listener to cut/close side drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSideDrawerOpen) {
        setIsSideDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSideDrawerOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const categories = [
    { name: 'Protein', label: '100% Whey Protein' },
    { name: 'Creatine', label: 'Monohydrate Creatine' },
    { name: 'Mass Gainer', label: 'High Calorie Mass Gainer' },
    { name: 'Pre-Workout', label: 'Energy & Pre-Workout' },
    { name: 'Supplements', label: 'BCAA & Aminos' },
    { name: 'Vitamins', label: 'Daily Vitamins & Fish Oil' }
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-all duration-300 ${
        isDark ? 'bg-slate-950/85 border-slate-800/80 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* LEFT: Brand Logo & Main Nav Links in ONE Line */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {/* Brand Logo */}
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-base sm:text-lg font-black tracking-tight leading-none flex items-center gap-0.5 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    OG-<span className="gradient-text">SUPPLEMENT</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-emerald-500 mt-0.5 leading-none">
                    Authentic Performance
                  </span>
                </div>
              </Link>

              {/* Main Visible Nav Links: Home, Store, Best Sellers & Results */}
              <nav className="hidden sm:flex items-center gap-1 lg:gap-1.5">
                <Link
                  to="/"
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    location.pathname === '/'
                      ? 'text-emerald-400 bg-emerald-500/10 font-bold shadow-sm'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                      : 'text-slate-700 hover:text-black hover:bg-slate-100'
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/products"
                  onClick={() => setSelectedCategory('All')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    location.pathname === '/products'
                      ? 'text-emerald-400 bg-emerald-500/10 font-bold shadow-sm'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                      : 'text-slate-700 hover:text-black hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Store & Catalog</span>
                </Link>

                <Link
                  to="/best-sellers"
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    location.pathname === '/best-sellers'
                      ? 'text-amber-400 bg-amber-500/15 font-bold shadow-sm border border-amber-500/30'
                      : isDark
                      ? 'text-slate-300 hover:text-amber-400 hover:bg-slate-900'
                      : 'text-slate-700 hover:text-amber-600 hover:bg-slate-100'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Best Sellers</span>
                  <span className="hidden xl:inline-block px-1 py-0.2 text-[9px] font-black uppercase rounded bg-amber-500 text-black">
                    HOT
                  </span>
                </Link>

                <Link
                  to="/reviews"
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    location.pathname === '/reviews'
                      ? 'text-emerald-400 bg-emerald-500/15 font-bold shadow-sm border border-emerald-500/30'
                      : isDark
                      ? 'text-slate-300 hover:text-emerald-400 hover:bg-slate-900'
                      : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Customer Results</span>
                </Link>
              </nav>
            </div>

            {/* RIGHT: Search Bar + Theme + Cart + Login/Signup + Side Menu Button */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Dynamic Compact Search Bar (Moved to RIGHT side) */}
              <div className="relative hidden md:block">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search supplements..."
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    className={`w-44 lg:w-56 focus:w-64 border rounded-full pl-8 pr-7 py-1.5 text-xs transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-emerald-500'
                        : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600 focus:bg-white'
                    }`}
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  {localSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch('');
                        setSearchQuery('');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </form>
              </div>

              {/* Notification Bell Icon with Dot */}
              <div ref={notifDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2 rounded-xl border transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black hover:bg-slate-200'
                  }`}
                  title="Special Offers & Announcements"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className={`absolute right-0 mt-2 w-72 sm:w-80 backdrop-blur-xl border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 ${
                    isDark ? 'bg-slate-900/98 border-slate-800 text-slate-100' : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-300/50'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">⚡ Live Announcements</span>
                      <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-white p-0.5">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-bold text-emerald-400">🔥 100% Genuine Guarantee</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">All products lab-tested with original brand importer seals.</p>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-bold text-cyan-400">⚡ Instant Razorpay Refund Active</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Automated online refunds with 3-stage live bank tracking.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle Button (Sun / Moon) */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:border-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black hover:bg-slate-200'
                }`}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Cart Button (Clean, Compact with item badge) */}
              <Link
                to="/cart"
                className={`relative p-2 rounded-xl border transition-all group ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-emerald-400 hover:border-emerald-500/40'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-emerald-600 hover:bg-slate-200'
                }`}
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-emerald-500 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-emerald-500/50 animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Auth: Login & Sign Up (Clean, Sleek Compact Buttons) */}
              {isAuthenticated ? (
                <div ref={profileDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                        : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[11px]">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-52 backdrop-blur-xl border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 ${
                      isDark ? 'bg-slate-900/98 border-slate-800' : 'bg-white/98 border-slate-200 shadow-slate-300/50'
                    }`}>
                      <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <p className="text-[10px] text-slate-400">Signed in as</p>
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{user?.name}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                            isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>My Orders & Tracking</span>
                        </Link>
                      </div>

                      <div className={`pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                        : 'text-slate-700 hover:text-black hover:bg-slate-100'
                    }`}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm transition-all active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* SIDE MENU HAMBURGER BUTTON (Opens Side Drawer containing Policies, Order History & More) */}
              <button
                type="button"
                onClick={() => setIsSideDrawerOpen(true)}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black hover:bg-slate-200'
                }`}
                title="Open Side Menu (Policies, Order Tracking & Support)"
                aria-label="Open Menu"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
              </button>

            </div>
          </div>

          {/* Mobile Search Input (Visible only on small phones below md) */}
          <div className="md:hidden pb-2.5">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search supplements..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className={`w-full border rounded-full pl-8 pr-8 py-1.5 text-xs focus:outline-none ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-400 focus:border-emerald-500'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* SLIDE-OUT SIDE DRAWER (Contains Policies, Order History & More) */}
      {/* ======================================================== */}
      {isSideDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop blur */}
          <div
            onClick={() => setIsSideDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Side Drawer Content */}
          <div className={`relative w-full max-w-sm h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300 border-l ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Drawer Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">OG-SUPPLEMENT</h3>
                  <p className="text-[10px] text-slate-400">Navigation & Customer Care</p>
                </div>
              </div>

              {/* Cut / Close Button */}
              <button
                type="button"
                onClick={() => setIsSideDrawerOpen(false)}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 font-bold group shadow-sm ${
                  isDark
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                }`}
                title="Cut / Close Menu"
              >
                <span className="text-xs font-bold">Cut</span>
                <X className="w-4 h-4 text-rose-400 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
              
              {/* Primary Actions: Order History & Store */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2">Quick Navigation</p>
                
                <Link
                  to="/"
                  onClick={() => setIsSideDrawerOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold">Home Page</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  to="/products"
                  onClick={() => {
                    setSelectedCategory('All');
                    setIsSideDrawerOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold">All Products & Store</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  to="/best-sellers"
                  onClick={() => setIsSideDrawerOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <div>
                      <span className="font-bold">Best Selling Products</span>
                      <p className="text-[10px] text-slate-400">Top selling supplements & formulas</p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-black">HOT</span>
                </Link>

                <Link
                  to="/reviews"
                  onClick={() => setIsSideDrawerOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <div>
                      <span className="font-bold">Happy Customers & Results</span>
                      <p className="text-[10px] text-slate-400">Before/after results & 4.9★ reviews</p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-black">RESULTS</span>
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setIsSideDrawerOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 transition-all ${
                    isDark ? 'bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-black">Order History & Tracking</span>
                      <p className="text-[10px] text-slate-400">Track live courier & refund updates</p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-black">Live</span>
                </Link>
              </div>

              {/* Categories Direct Links */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2">Top Categories</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.name);
                        setIsSideDrawerOpen(false);
                        navigate('/products');
                      }}
                      className={`text-left p-2 rounded-xl text-[11px] font-semibold border transition-all truncate ${
                        isDark ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 hover:border-cyan-500 text-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Information & Store Policies (Moved INSIDE Side Navbar) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2">Information & Policies</p>
                <div className="space-y-1">
                  
                  <Link
                    to="/about"
                    onClick={() => setIsSideDrawerOpen(false)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-slate-900 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>About Us & Authenticity</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  <Link
                    to="/cancellation-policy"
                    onClick={() => setIsSideDrawerOpen(false)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-slate-900 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cancellation & Refund Policy</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  <Link
                    to="/shipping-policy"
                    onClick={() => setIsSideDrawerOpen(false)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-slate-900 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Shipping & Fast Dispatch</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  <Link
                    to="/privacy-policy"
                    onClick={() => setIsSideDrawerOpen(false)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-slate-900 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Privacy Policy</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  <Link
                    to="/terms"
                    onClick={() => setIsSideDrawerOpen(false)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-slate-900 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Terms & Conditions</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  <Link
                    to="/license"
                    onClick={() => setIsSideDrawerOpen(false)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-slate-900 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Importer Licenses & Certifications</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  <Link
                    to="/faq"
                    onClick={() => setIsSideDrawerOpen(false)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isDark ? 'hover:bg-slate-900 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Help & Frequently Asked Questions</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                </div>
              </div>

              {/* Customer Support Card */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Customer Support</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Koi sawaal ya refund enquiry ke liye direct email karein:
                </p>
                <a
                  href="mailto:sk7161853@gmail.com"
                  className="block text-center py-2 px-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm transition-all"
                >
                  sk7161853@gmail.com
                </a>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className={`p-4 border-t text-center text-[10px] text-slate-500 ${
              isDark ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200 bg-white'
            }`}>
              OG-SUPPLEMENT • 100% Authentic Gym Nutrition
            </div>

          </div>
        </div>
      )}
    </>
  );
}
