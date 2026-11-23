import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, Sparkles, Eye, EyeOff, MapPin, KeyRound, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const { verifyAndLogin } = useAuth();
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/';

  // Step 1: Submit Form -> Send OTP to Email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendRegisterOtp({
        name,
        email,
        phone,
        password,
        address,
        city,
        state: stateVal,
        pincode
      });

      if (res && res.success) {
        addToast(res.message || 'Verification OTP sent to your email!', 'success');
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create user
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      addToast('Please enter the complete 6-digit verification code', 'warning');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await api.verifyRegisterOtp({
        email,
        otp: otp.trim()
      });

      if (res && res.success) {
        verifyAndLogin(res);
        setShowOtpModal(false);
        navigate(redirectTarget);
      }
    } catch (err) {
      addToast(err.message || 'Invalid or expired OTP', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const res = await api.sendRegisterOtp({
        name,
        email,
        phone,
        password,
        address,
        city,
        state: stateVal,
        pincode
      });
      addToast('A new 6-digit OTP has been sent to your email!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to resend OTP', 'error');
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className={`min-h-[85vh] flex items-center justify-center py-12 px-4 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-md w-full space-y-6">
        
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950/60 mx-auto">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Join the OG-Supplement athlete network for faster checkout and exclusive deals
          </p>
        </div>

        {/* Main Signup Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vikram Malhotra"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@example.com"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Optional Delivery Address for 1-Click Fast Checkout */}
            <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Delivery Address (Auto-fills Checkout)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Recommended</span>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat / House No., Building Name, Street / Sector"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
                <input
                  type="text"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="State"
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  maxLength={6}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 pt-1">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="accent-emerald-500 rounded w-3.5 h-3.5 cursor-pointer"
                />
                <span>Show Password</span>
              </label>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-emerald-500 hover:underline">Terms of Service</Link> and{' '}
              <Link to="/privacy-policy" className="text-emerald-500 hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Join & Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to={`/login${location.search}`} className="text-emerald-500 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* 6-DIGIT EMAIL OTP VERIFICATION MODAL */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className={`relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl border p-5 sm:p-8 space-y-5 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon & Title */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Verify Your Email
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  We've sent a 6-digit verification code to <span className="font-bold text-emerald-400">{email}</span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[12px] text-2xl font-black py-3 rounded-2xl border bg-slate-950 border-slate-800 text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                  <span className="block text-center text-[11px] text-slate-500">
                    Code is valid for 10 minutes
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp || otp.length !== 6}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {verifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Create Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend Link */}
              <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  disabled={resendingOtp}
                  onClick={handleResendOtp}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer disabled:opacity-50"
                >
                  {resendingOtp ? 'Resending...' : 'Resend Code'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
