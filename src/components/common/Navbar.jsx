import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  Shield,
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
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import MegaMenu from './MegaMenu';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { searchQuery, setSearchQuery, setSelectedCategory } = useProducts();
  const { theme, toggleTheme, isDark } = useTheme();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const navigate = useNavigate();
  const location = useLocation();
  const megaMenuTimeoutRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-all duration-300 ${
      isDark ? 'bg-slate-950/80 border-slate-800/80 text-slate-100' : 'bg-white/85 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-extrabold tracking-tight flex items-center gap-1 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                APEX<span className="gradient-text font-black">NUTRA</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 -mt-1">
                Elite Performance
              </span>
            </div>
          </Link>

          {/* Desktop Dynamic Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search Whey, Creatine, MuscleBlaze, ON..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className={`w-full border rounded-full pl-11 pr-10 py-2 text-sm transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700/70 text-slate-100 placeholder-slate-400 focus:border-emerald-500'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600 focus:bg-white'
                }`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchQuery('');
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Main Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/'
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : isDark
                  ? 'text-slate-200 hover:text-emerald-400 hover:bg-slate-800/40'
                  : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/products'
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : isDark
                  ? 'text-slate-200 hover:text-emerald-400 hover:bg-slate-800/40'
                  : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-100'
              }`}
            >
              Categories & Store
            </Link>

            <Link
              to="/orders"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/orders'
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : isDark
                  ? 'text-slate-200 hover:text-emerald-400 hover:bg-slate-800/40'
                  : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              Order History
            </Link>

            {/* Hidden Dropdown / Mega Menu Trigger */}
            <div
              className="relative"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isMegaMenuOpen
                    ? 'text-emerald-500 bg-slate-800/40'
                    : isDark
                    ? 'text-slate-200 hover:text-emerald-400 hover:bg-slate-800/40'
                    : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-100'
                }`}
              >
                <span>Information & Policies</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Admin Direct Quick Access */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-3.5 py-1.5 ml-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-950/50"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Icons (Theme, Cart, Auth, Mobile toggle) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Theme Toggle Button (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 text-amber-400 border-slate-700/60 hover:rotate-12'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 hover:-rotate-12'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Button with Animated Pill Badge */}
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-xl border transition-all group ${
                isDark
                  ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-100 hover:text-emerald-400 border-slate-700/60'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-emerald-600 border-slate-300'
              }`}
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-emerald-500 text-black text-xs font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-100'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline font-semibold">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    className={`absolute right-0 mt-2 w-56 backdrop-blur-xl border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 ${
                      isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
                    }`}
                  >
                    <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{user?.name}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders
                      </Link>
                    </div>

                    <div className={`pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    isDark
                      ? 'text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                      : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl border ${
                isDark ? 'bg-slate-800/60 text-slate-300 hover:text-white border-slate-700/60' : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search Whey, Creatine, ON..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className={`w-full border rounded-full pl-10 pr-9 py-2 text-xs focus:outline-none ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700/70 text-slate-100 placeholder-slate-400 focus:border-emerald-500'
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600'
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* MegaMenu Dropdown (Desktop) */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
      />

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden border-b px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-3 max-h-[85vh] overflow-y-auto ${
          isDark ? 'bg-slate-900/98 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}>
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-500" />
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => {
                setSelectedCategory('All');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-500" />
              All Products & Categories
            </Link>
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              Order History
            </Link>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          <div className={`pt-3 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Policies & Support</p>
            <div className={`grid grid-cols-2 gap-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">About Us</Link>
              <Link to="/license" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">Licenses</Link>
              <Link to="/privacy-policy" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">Privacy Policy</Link>
              <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">Terms & Conditions</Link>
              <Link to="/return-policy" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">Return Policy</Link>
              <Link to="/shipping-policy" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">Shipping Policy</Link>
              <Link to="/cancellation-policy" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">Cancellation Policy</Link>
              <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-lg">Help & FAQ</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
