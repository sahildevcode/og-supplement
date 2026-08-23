import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, phone, password, role: 'customer' });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-950 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950/60 mx-auto">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Join the ApexNutra athlete network for faster checkout and exclusive deals
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@example.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mobile Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Now'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
