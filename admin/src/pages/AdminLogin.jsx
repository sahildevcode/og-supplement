import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('og_admin_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('og_admin_saved_email', email);
      } else {
        localStorage.removeItem('og_admin_saved_email');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setSimulatedCode('');
    setForgotLoading(true);

    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.simulatedOtp) {
        setSimulatedCode(res.simulatedOtp);
      }
      setForgotSuccess(res.message || '6-digit OTP code has been sent to your email.');
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to send OTP code. Please verify email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await api.resetPassword(forgotEmail, otp, newPassword);
      setForgotSuccess(res.message || 'Password reset successfully!');
      
      // Update login email & password and return to login screen after 1.5s
      setEmail(forgotEmail);
      setPassword(newPassword);

      setTimeout(() => {
        setIsForgotMode(false);
        setForgotStep(1);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotSuccess('');
        setSimulatedCode('');
      }, 1500);
    } catch (err) {
      setForgotError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-950/60 mx-auto">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              OG-Admin Control Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
              Standalone Management Suite
            </p>
          </div>
        </div>

        {/* Login or Forgot Password Card */}
        {isForgotMode ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5 animate-page-enter">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <button
                type="button"
                onClick={() => { setIsForgotMode(false); setForgotError(''); setForgotSuccess(''); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Step {forgotStep} of 2
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <span>Reset Administrator Password</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {forgotStep === 1
                  ? "Enter your registered Administrator Email to receive a 6-digit OTP code."
                  : `Enter the 6-digit code sent to ${forgotEmail} and create a new password.`}
              </p>
            </div>

            {forgotError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {simulatedCode && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
                <span>Verification OTP Code:</span>
                <span className="font-mono font-black text-sm tracking-widest bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-500/40 text-cyan-300">{simulatedCode}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Registered Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="juniourkhan9@gmail.com"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Sending Verification OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-base text-center font-mono font-bold tracking-[6px] text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showNewPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-cyan-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify & Reset Password</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotError(''); setForgotSuccess(''); }}
                    className="text-xs text-slate-400 hover:text-cyan-400 cursor-pointer underline"
                  >
                    Resend OTP to email
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Administrator Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ogsupplement.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Administrator Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-cyan-400 transition-colors p-1.5 z-20 cursor-pointer rounded-lg hover:bg-slate-800/60"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-cyan-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Show Password Checkboxes */}
              <div className="flex items-center justify-between text-xs pt-1 pb-1">
                <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 accent-cyan-500 cursor-pointer"
                  />
                  <span>Show Password</span>
                </label>

                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 accent-cyan-500 cursor-pointer"
                  />
                  <span>Remember Email</span>
                </label>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                    setForgotEmail(email || 'juniourkhan9@gmail.com');
                    setForgotStep(1);
                    setForgotError('');
                    setForgotSuccess('');
                    setSimulatedCode('');
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Access Admin Control Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <p className="text-[11px] text-center text-slate-500">
          🔒 Encrypted 256-Bit Standalone Administrative Suite
        </p>

      </div>
    </div>
  );
}
