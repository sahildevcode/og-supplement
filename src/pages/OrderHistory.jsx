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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useToast } from '../context/ToastContext';

export default function OrderHistory() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState(user?.email || '');
  
  // Cancel Order Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);

    try {
      const id = cancellingOrder._id || cancellingOrder.orderId;
      await api.updateOrderStatus(id, 'Cancelled');
      
      // Update local orders list state
      setOrders((prev) =>
        prev.map((o) => (o.orderId === cancellingOrder.orderId || o._id === id ? { ...o, orderStatus: 'Cancelled' } : o))
      );

      addToast(`Order #${cancellingOrder.orderId} has been successfully cancelled.`, 'info');
      setCancellingOrder(null);
    } catch (error) {
      addToast(error.message || 'Failed to cancel order', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Placed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">Order Placed</span>;
      case 'Processing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">Processing & Packing</span>;
      case 'Shipped':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-500 border border-purple-500/30">In Transit / Shipped</span>;
      case 'Delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Delivered</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getStepProgress = (status) => {
    const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = steps.indexOf(status);
    return { steps, currentIdx: currentIdx === -1 ? 0 : currentIdx };
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
              const { steps, currentIdx } = getStepProgress(order.orderStatus);
              const canCancel = order.orderStatus === 'Order Placed' || order.orderStatus === 'Processing';

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
                        {getStatusBadge(order.orderStatus)}
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

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {order.paymentMethod} • {order.paymentStatus || 'Pending'}
                        </p>
                      </div>

                      {/* Cancel Order Action Button */}
                      {canCancel && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                          title="Cancel this order"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step Tracker (If not cancelled) */}
                  {order.orderStatus !== 'Cancelled' ? (
                    <div className="py-2">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 -z-0 ${
                          isDark ? 'bg-slate-800' : 'bg-slate-200'
                        }`} />
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 -z-0"
                          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((step, idx) => {
                          const isDone = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div key={step} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                                    : isDark ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-slate-100 text-slate-400 border border-slate-300'
                                } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span className={`text-[10px] sm:text-xs font-bold mt-2 whitespace-nowrap ${
                                isDone ? 'text-emerald-500' : 'text-slate-400'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Cancelled Order Notice */
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                      isDark ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                      <div className="text-xs">
                        <p className="font-bold">This order has been cancelled.</p>
                        <p className="opacity-80">Reserved items have been returned to warehouse inventory.</p>
                      </div>
                    </div>
                  )}

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

      {/* Confirmation Modal for Order Cancellation */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black">
                Cancel Order #{cancellingOrder.orderId}?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you wish to cancel this order? Once cancelled, the items will be returned to store stock.
              </p>
            </div>

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
                <XCircle className="w-4 h-4" />
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
