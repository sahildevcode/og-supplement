import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Lock, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, demoLogin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // If not logged in as Admin, show friendly Protected Access Guard
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Admin Access Restricted</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This management suite is restricted to authorized store administrators. Please sign in with admin credentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <button
              onClick={async () => {
                setUnlocking(true);
                try {
                  await demoLogin('admin');
                } finally {
                  setUnlocking(false);
                }
              }}
              disabled={unlocking}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              {unlocking ? 'Authenticating Admin...' : '1-Click Unlock Demo Admin Panel'}
            </button>

            <Link
              to="/login"
              className="block w-full py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Go to Standard Login Page
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
          >
            <Store className="w-3.5 h-3.5" />
            Return to Customer Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Admin Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-slate-950">
        <AdminHeader setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
