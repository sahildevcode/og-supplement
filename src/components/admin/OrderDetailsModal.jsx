import React, { useState } from 'react';
import { X, Truck, User, Phone, Mail, MapPin, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrderDetailsModal({ isOpen, onClose, order, onStatusChanged }) {
  const { addToast } = useToast();
  const [status, setStatus] = useState(order?.orderStatus || 'Order Placed');
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const id = order._id || order.id || order.orderId;
      await api.updateOrderStatus(id, newStatus);
      setStatus(newStatus);
      addToast(`Order #${order.orderId} status changed to "${newStatus}"!`, 'success');
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const statuses = ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-mono font-black text-cyan-400">
                {order.orderId}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300">
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Order Date: {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Switcher Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Change Live Fulfillment Status:</span>
            {updating && <span className="text-cyan-400 text-xs font-normal animate-pulse">Broadcasting socket update...</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                disabled={updating}
                onClick={() => handleStatusUpdate(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === s
                    ? s === 'Cancelled'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                      : s === 'Delivered'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950/50'
                      : 'bg-cyan-500 text-black shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Customer Information
            </h4>
            <p className="text-slate-100 font-semibold text-sm">{order.customerName}</p>
            <p className="text-slate-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {order.phone}</p>
            <p className="text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {order.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Delivery Address
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {order.address}, {order.city}, {order.state} - {order.pincode}
            </p>
            {order.landmark && <p className="text-slate-400">Landmark: {order.landmark}</p>}
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Products:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.products?.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 border border-slate-800 flex-shrink-0"
                  />
                  <div>
                    <p className="font-bold text-slate-200">{item.name}</p>
                    <p className="text-slate-400">{item.variant} • {item.flavour} (Qty: {item.quantity})</p>
                  </div>
                </div>
                <span className="font-bold text-white whitespace-nowrap">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal:</span>
            <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount Applied:</span>
              <span>- ₹{order.discount?.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Shipping:</span>
            <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm text-white">
            <span>Total Collected ({order.paymentMethod}):</span>
            <span className="text-cyan-400">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
