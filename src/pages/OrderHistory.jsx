import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag
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
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getStepProgress = (status) => {
    const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = steps.indexOf(status);
    return { steps, currentIdx: currentIdx === -1 ? 0 : currentIdx };
  };

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
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black transition-all"
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

              return (
                <div
                  key={order.orderId || order._id}
                  className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-100'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
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

                    <div className="text-right">
                      <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {order.paymentMethod} • {order.paymentStatus || 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Step Tracker (Only if not cancelled) */}
                  {order.orderStatus !== 'Cancelled' && (
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
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Fast Dispatch
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
