import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Shield, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      const data = await demoLogin(role);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-950 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950/60 mx-auto">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sign In to ApexNutra
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Access your orders, personalized nutrition stacks, and profile
          </p>
        </div>

        {/* Demo Fast Login Switchers */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            🚀 1-Click Fast Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Demo Customer
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to demo registered email.'); }} className="text-[11px] font-semibold text-emerald-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-emerald-400 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
