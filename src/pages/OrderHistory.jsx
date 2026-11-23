import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
  XCircle,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  X,
  RotateCcw,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useToast } from '../context/ToastContext';
import OrderTrackerTimeline from '../components/common/OrderTrackerTimeline';

export default function OrderHistory() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState(user?.email || '');
  
  // Cancel Order Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelPreview, setCancelPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake / wrong quantity');
  const [isCancelling, setIsCancelling] = useState(false);

  // Help Modal State
  const [helpOrder, setHelpOrder] = useState(null);
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  const isPrepaidOrder = (ord) => {
    if (!ord) return false;
    if (ord.paymentMethod === 'Cash on Delivery') return false;
    if (ord.paymentStatus === 'Paid') return true;
    if ((ord.paymentMethod?.includes('Razorpay') || ord.paymentMethod?.includes('Online')) && ord.transactionId) return true;
    return false;
  };

  const handleOpenCancelModal = async (order) => {
    setCancellingOrder(order);
    setCancelPreview(null);
    setCancelReason('Ordered by mistake / wrong quantity');

    const isPrepaid = isPrepaidOrder(order);
    // If Cash on Delivery, no refund preview is needed
    if (!isPrepaid) {
      setLoadingPreview(false);
      return;
    }

    setLoadingPreview(true);
    try {
      const id = order.orderId || order._id;
      const preview = await api.getCancellationPreview(id);
      if (preview && preview.success) {
        setCancelPreview(preview);
      }
    } catch (e) {
      console.warn('Preview fetch error, fallback to local calculation', e);
    } finally {
      setLoadingPreview(false);
    }
  };

  const fetchOrders = async (emailToUse) => {
    try {
      setLoading(true);
      const email = emailToUse || user?.email || localStorage.getItem('apex_last_order_email');
      const data = await api.getMyOrders(email);
      if (data && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('[Fetch Orders Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Real-Time Socket.IO Listener for Order Status Changes
  useEffect(() => {
    const handleStatusUpdate = ({ orderId, orderStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus } : o))
      );
      addToast(`Order #${orderId} status updated to "${orderStatus}"!`, 'info');
    };

    socket.on('order:statusUpdated', handleStatusUpdate);

    return () => {
      socket.off('order:statusUpdated', handleStatusUpdate);
    };
  }, [addToast]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchEmail) {
      localStorage.setItem('apex_last_order_email', searchEmail);
      fetchOrders(searchEmail);
    }
  };

  const getOrderCancelBreakdown = (order) => {
    if (!order) return { isPaid: false, totalAmount: 0, fee: 0, refund: 0 };
    const isPaid = isPrepaidOrder(order);
    const totalAmount = Number(order.totalAmount || 0);
    if (!isPaid) {
      return { isPaid: false, totalAmount, fee: 0, refund: 0 };
    }

    let totalFee = 0;
    (order.products || []).forEach((item) => {
      const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
      let itemFee = 0;
      if (item.isCancellationFeeApplicable !== false) {
        const type = item.cancellationFeeType || 'percentage';
        const val = Number(item.cancellationFeeValue !== undefined ? item.cancellationFeeValue : 5);
        if (type === 'percentage') {
          itemFee = Math.round((itemTotal * val) / 100);
        } else {
          itemFee = Math.round(val * Number(item.quantity || 1));
        }
      }
      totalFee += itemFee;
    });

    totalFee = Math.min(totalAmount, Math.max(0, totalFee));
    const refund = Math.max(0, totalAmount - totalFee);
    return { isPaid: true, totalAmount, fee: totalFee, refund };
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);

    try {
      const id = cancellingOrder.orderId || cancellingOrder._id;
      const res = await api.cancelOrder(id, cancelReason);
      
      // Update local orders list state
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === cancellingOrder.orderId || o._id === id
            ? {
                ...o,
                orderStatus: 'Cancelled',
                paymentStatus: res.order?.paymentStatus || (cancellingOrder.paymentStatus === 'Paid' ? 'Refunded' : o.paymentStatus),
                refundAmount: res.order?.refundAmount || res.breakdown?.refundAmount,
                cancellationFee: res.order?.cancellationFee || res.breakdown?.cancellationFee
              }
            : o
        )
      );

      const msg = res.message || `Order #${cancellingOrder.orderId} has been successfully cancelled.`;
      addToast(msg, 'success');
      setCancellingOrder(null);
    } catch (error) {
      addToast(error.message || 'Failed to cancel order', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status, order = {}) => {
    switch (status) {
      case 'Order Placed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">Order Placed</span>;
      case 'Packed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Packed</span>;
      case 'Processing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">Processing & Packing</span>;
      case 'Shipped':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-500 border border-purple-500/30">In Transit / Shipped</span>;
      case 'Out for Delivery':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">Out for Delivery</span>;
      case 'Delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Delivered</span>;
      case 'Cancelled':
      case 'Refunded':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const cancelReasons = [
    'Ordered by mistake / wrong quantity',
    'Found a better supplement or deal',
    'Incorrect shipping address entered',
    'Delivery taking too long',
    'Other reason'
  ];

  return (
    <div className={`min-h-screen py-10 sm:py-14 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Title */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-500">
              <Clock className="w-4 h-4" />
              <span>Real-Time Order Tracking</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-black tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Order History
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track live packing, dispatch and delivery statuses for all your supplement orders
            </p>
          </div>

          {/* Email Filter / Lookup */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Search by order email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className={`border rounded-xl px-3.5 py-2 text-xs focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
              }`}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Sign In Reminder Banner for Guest Viewers */}
        {!user && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Want to sync and track all your orders across any phone or laptop? <span className="font-bold text-white">Sign in to your account</span>.
              </p>
            </div>
            <Link
              to="/login?redirect=/orders"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all whitespace-nowrap"
            >
              Sign In to Account
            </Link>
          </div>
        )}

        {/* Orders Listing */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-44 rounded-3xl animate-pulse border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className={`py-20 text-center space-y-4 border rounded-3xl max-w-md mx-auto p-8 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
            }`}>
              <Package className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No Orders Found</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              We couldn't find any recent orders associated with your account or search email.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 text-black shadow-lg shadow-emerald-950/40"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Supplements
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const canCancel = order.orderStatus === 'Order Placed';

              return (
                <div
                  key={order.orderId || order._id}
                  className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl transition-all ${
                    order.orderStatus === 'Cancelled'
                      ? isDark ? 'bg-slate-900/40 border-rose-900/30 opacity-80' : 'bg-rose-50/40 border-rose-200'
                      : isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-100'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-emerald-500 text-base">
                          {order.orderId}
                        </span>
                        {getStatusBadge(order.orderStatus, order)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                      <div className="text-right">
                        <p className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400">
                          {order.paymentMethod} • {(order.orderStatus === 'Delivered' || order.paymentStatus === 'Paid') ? 'Paid' : (order.paymentStatus || 'Pending')}
                        </p>
                        {order.transactionId && (
                          <span className="inline-block text-[9px] sm:text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-0.5">
                            UTR: {order.transactionId}
                          </span>
                        )}
                      </div>

                      {/* Always Visible Help Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setHelpOrder(order);
                          setIsCopiedEmail(false);
                        }}
                        className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                        title="Get help or email support for this order"
                      >
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span>Help</span>
                      </button>

                      {/* Cancel Order Action Button (Only prior to dispatch) */}
                      {canCancel && (
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                          title="Cancel this order"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flipkart 4-Stage Tracker Component */}
                  <OrderTrackerTimeline order={order} isDark={isDark} />

                  {/* Products list in order */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.products?.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border flex items-center gap-3 ${
                            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className={`w-12 h-12 rounded-xl object-contain p-1 border flex-shrink-0 ${
                              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                            }`}
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.name}</p>
                            <p className="text-slate-400">{item.variant} • {item.flavour}</p>
                            <p className="text-emerald-500 font-semibold mt-0.5">
                              ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address Summary */}
                  <div className={`pt-3 border-t text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-100'
                  }`}>
                    <div>
                      <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Delivery Address: </span>
                      <span>{order.address}, {order.city}, {order.state} - {order.pincode} ({order.customerName} - {order.phone})</span>
                    </div>
                    {order.orderStatus !== 'Cancelled' && (
                      <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                        <Truck className="w-3.5 h-3.5" /> Fast Dispatch
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Help & Support Modal */}
      {helpOrder && (() => {
        const emailAddress = 'sk7161853@gmail.com';
        const emailSubject = `Need Help with Order #${helpOrder.orderId}`;
        const emailBody = `Hello OG-Supplement Support Team,\n\nI need help with my order #${helpOrder.orderId}.\n\nOrder Status: ${helpOrder.orderStatus}\nTotal Amount: ₹${helpOrder.totalAmount}\n\nIssue Details:\n[Please write your issue or question here]\n\nThank you.`;

        // Direct webmail link for Gmail web users
        const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Native mailto URL
        const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        const handleCopyEmail = () => {
          navigator.clipboard.writeText(emailAddress);
          setIsCopiedEmail(true);
          addToast('Support email copied to clipboard!', 'success');
          setTimeout(() => setIsCopiedEmail(false), 2500);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className={`max-w-md w-full max-h-[88vh] flex flex-col rounded-3xl border shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              {/* Header */}
              <div className="p-5 pb-3 flex items-start justify-between border-b border-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black">
                      Help with Order #{helpOrder.orderId}
                    </h3>
                    <p className="text-[11px] text-slate-400">Direct official support</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHelpOrder(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <p className="text-slate-400 leading-relaxed text-xs">
                  Direct support email ke zariye hamari team se contact karein. Aap direct Gmail ya kisi bhi email app se message bhej sakte hain.
                </p>

                {/* Email Address Card */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Official Support Email</p>
                      <p className="text-xs sm:text-sm font-bold font-mono text-cyan-400 truncate">
                        {emailAddress}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                      isCopiedEmail
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isCopiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Order Info pill */}
                <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <p><strong>Order ID:</strong> #{helpOrder.orderId}</p>
                  <p><strong>Status:</strong> <span className="text-emerald-400 font-bold">{helpOrder.orderStatus}</span></p>
                  <p><strong>Amount:</strong> ₹{helpOrder.totalAmount?.toLocaleString('en-IN')}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <a
                    href={gmailWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in Gmail (Web)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={mailtoUrl}
                    className="w-full py-2.5 rounded-xl font-black text-xs bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in Default Email App</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Confirmation Modal for Order Cancellation */}
      {cancellingOrder && (() => {
        const isPrepaid = isPrepaidOrder(cancellingOrder);
        const breakdown = cancelPreview || getOrderCancelBreakdown(cancellingOrder);
        const totalAmt = Number(cancellingOrder.totalAmount || 0);
        const fee = breakdown.cancellationFee !== undefined ? breakdown.cancellationFee : (breakdown.fee || 0);
        const refundAmt = breakdown.refundAmount !== undefined ? breakdown.refundAmount : (breakdown.refund || Math.max(0, totalAmt - fee));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className={`max-w-md w-full my-auto p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black">
                  Cancel Order #{cancellingOrder.orderId}?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to cancel this order before dispatch?
                </p>
              </div>

              {/* High-visibility Refund & Deduction Breakdown Highlight Box */}
              {isPrepaid ? (
                <div className="space-y-2.5">
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2.5 mb-2.5 border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Refund Summary</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Prepaid Order
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Total Paid Amount */}
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Total Paid by Customer</span>
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          ₹{totalAmt.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Deduction / Cancellation Fee */}
                      <div className="flex items-center justify-between text-rose-400 font-semibold">
                        <span>Cancellation & Handling Fee (Cut)</span>
                        <span className="font-bold font-mono">
                          - ₹{fee.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Net Refund Amount Returned */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div>
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                            Total Refund Amount
                          </p>
                          <p className="text-[10px] text-slate-400">
                            (Ye paisa aapke account mein wapas aayega)
                          </p>
                        </div>
                        <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                          ₹{refundAmt.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clarification Alert Pill */}
                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2.5 ${
                    isDark ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <p>
                      <strong>Clear Notice:</strong> Cancellation charge <strong>₹{fee}</strong> cut hoga aur <strong>₹{refundAmt}</strong> aapke source payment method (UPI / Bank / Card) mein <strong>2 se 4 business days</strong> mein credit ho jayega.
                    </p>
                  </div>
                </div>
              ) : (
                /* Cash on Delivery Notice */
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black flex-shrink-0 text-xs border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">Cash on Delivery Order</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No payment has been collected yet. This order will be cancelled with zero penalty.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Reason for cancellation:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-slate-200 focus:border-rose-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-rose-600'
                  }`}
                >
                  {cancelReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  disabled={isCancelling}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs ${
                    isDark ? 'bg-slate-800 hover:bg-slate-750 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Keep My Order
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className={`w-4 h-4 ${isCancelling ? 'animate-spin' : ''}`} />
                  {isCancelling ? 'Cancelling...' : (isPrepaid ? `Confirm & Refund ₹${refundAmt}` : 'Cancel Order')}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
