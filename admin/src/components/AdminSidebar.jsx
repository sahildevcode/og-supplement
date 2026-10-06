import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Layers,
  QrCode,
  Shield,
  LogOut,
  ChevronRight,
  Flame,
  X
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { logout } = useAdminAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products Catalog', path: '/products', icon: Package },
    { name: 'Best Sellers Manager', path: '/best-sellers', icon: Flame },
    { name: 'Homepage Categories', path: '/categories', icon: Layers },
    { name: 'Payment & QR Code', path: '/payment-settings', icon: QrCode },
    { name: 'Live Stock Control', path: '/stock', icon: Boxes },
    { name: 'Orders Fulfillment', path: '/orders', icon: ShoppingCart },
    { name: 'Customers Directory', path: '/customers', icon: Users },
  ];

  return (
    <>
      {/* Universal Backdrop overlay (Click outside to Cut/Close) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
          title="Click to Close Navigation"
        />
      )}

      {/* Slide-in Sidebar (Only opens when clicked, hides when Cut/closed) */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-7 overflow-y-auto">
          
          {/* Header: Logo + Cut/Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-950/60 flex-shrink-0">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">
                  OG-<span className="text-cyan-400">ADMIN</span>
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Management Gateway
                </span>
              </div>
            </Link>

            {/* Cut / Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700/80 hover:border-rose-500/40 transition-all flex items-center gap-1.5 group shadow-sm"
              title="Close / Cut Sidebar"
            >
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-rose-300">Cut</span>
              <X className="w-4 h-4 text-slate-300 group-hover:text-rose-400 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>


          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </NavLink>
              );
            })}
          </nav>

        </div>

        {/* Footer Quick Links */}
        <div className="p-6 border-t border-slate-800 space-y-3">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
