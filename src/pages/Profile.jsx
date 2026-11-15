import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  MapPin,
  Lock,
  Phone,
  Package,
  Clock,
  ShieldCheck,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'orders'

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Status & Orders state
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Sync initial user details
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user?.email) return;
      try {
        setOrdersLoading(true);
        const data = await api.getMyOrders(user.email);
        if (data && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.warn('Could not load user orders', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    try {
      setIsChangingPass(true);
      await updateProfile({
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsChangingPass(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 sm:py-12 transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/" className="hover:text-emerald-500">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>Account</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-500 font-bold">My Profile</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                <span>My Profile & Account</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage your personal details, delivery addresses, security credentials, and orders.
              </p>
            </div>

            {/* User Quick Info Pill */}
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center font-black text-base shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">{user?.name || 'Customer'}</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            <div className={`p-2 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-black hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Personal Details & Address</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all mt-1 ${
                  activeTab === 'security'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-black hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4" />
                  <span>Password & Security</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all mt-1 ${
                  activeTab === 'orders'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-black hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Order History</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                  {orders.length}
                </span>
              </button>
            </div>

            {/* Quick Link Card to full tracking */}
            <div className={`p-4 rounded-2xl border text-left space-y-2 ${
              isDark ? 'bg-gradient-to-br from-emerald-950/20 to-slate-900 border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                <Truck className="w-4 h-4" />
                <span>Live Shipment Tracker</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Track your real-time courier status and cancel eligible orders instantly.
              </p>
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-500 hover:text-emerald-400 pt-1"
              >
                <span>Full Orders Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* TAB 1: Profile & Address */}
            {activeTab === 'profile' && (
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                  <div>
                    <h2 className="text-lg font-bold">Personal Information & Address</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Keep your shipping details and contact information updated.</p>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    {/* Email (Readonly or verified) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Email Address (Primary Account)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium cursor-not-allowed opacity-75 ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      />
                      <span className="text-[10px] text-slate-500">Contact support to change your primary registered email.</span>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Phone Number (for Courier & Order OTPs)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Delivery Address (House / Flat / Street / City / Pincode)</span>
                      </label>
                      <textarea
                        rows="3"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your complete delivery address here..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all resize-none ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400">
                        This address will automatically pre-fill during your checkout.
                      </span>
                    </div>

                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Profile & Address</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Password & Security */}
            {activeTab === 'security' && (
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                  <div>
                    <h2 className="text-lg font-bold">Change Password</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                  <Lock className="w-6 h-6 text-emerald-500" />
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-medium outline-none transition-all ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">New Password (min 6 characters)</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-medium outline-none transition-all ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isChangingPass ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: Order History */}
            {activeTab === 'orders' && (
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                  <div>
                    <h2 className="text-lg font-bold">Your Orders History</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Overview of your recent purchases and shipments.</p>
                  </div>
                  <Link
                    to="/orders"
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <span>Track All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
                    <h3 className="text-base font-bold">No orders placed yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Explore our high-performance authentic supplements and start your transformation today.
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-black hover:bg-emerald-400"
                    >
                      <span>Explore Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.orderId || order._id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isDark ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-500">#{order.orderId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : order.orderStatus === 'Cancelled'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {order.orderStatus || 'Processing'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })} • {order.products?.length || 1} items
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-sm font-black">
                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                          </span>
                          <Link
                            to="/orders"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                          >
                            Details & Track
                          </Link>
                        </div>
                      </div>
                    ))}

                    {orders.length > 5 && (
                      <div className="text-center pt-2">
                        <Link
                          to="/orders"
                          className="text-xs font-bold text-emerald-500 hover:underline"
                        >
                          View all {orders.length} orders →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}