import React, { useState } from 'react';
import { X, CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail, User } from 'lucide-react';
import { api } from '../services/api';
import { useAdminToast } from '../context/AdminToastContext';

export default function OrderDetailsModal({ isOpen, onClose, order, onStatusChange }) {
  const { addToast } = useAdminToast();
  const [currentStatus, setCurrentStatus] = useState(order?.orderStatus || 'Order Placed');
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const id = order.orderId || order._id;
      const res = await api.updateOrderStatus(id, newStatus);
      setCurrentStatus(newStatus);
      addToast(`Order #${id} status changed to "${newStatus}"!`, 'success');
      if (onStatusChange) onStatusChange(res.order || { ...order, orderStatus: newStatus });
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const statuses = ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Order ID:</span>
              <span className="font-mono font-black text-cyan-400 text-lg">{order.orderId}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Switcher */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Update Real-Time Order Status:</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => handleUpdateStatus(st)}
                disabled={updating || currentStatus === st}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentStatus === st
                    ? st === 'Delivered'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950/40'
                      : st === 'Cancelled'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-950/40'
                      : 'bg-cyan-500 text-black shadow-md shadow-cyan-950/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Customer Information
            </h4>
            <p className="text-sm font-bold text-white">{order.customerName}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {order.email}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {order.phone}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Delivery Address
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {order.address}, {order.city}, {order.state} - <span className="font-bold text-white">{order.pincode}</span>
            </p>
            {order.landmark && <p className="text-xs text-slate-400">Landmark: {order.landmark}</p>}
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ordered Products:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.products?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <p className="font-bold text-slate-200">{item.name}</p>
                  <p className="text-slate-400">{item.variant} • {item.flavour} • Qty: {item.quantity}</p>
                </div>
                <span className="font-mono font-bold text-white">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Payment Summary */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Payment Mode: <span className="font-bold text-white">{order.paymentMethod}</span></p>
            <p className="text-xs text-slate-400">Status: <span className="font-bold text-cyan-400">{order.paymentStatus || 'Pending'}</span></p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total Charged:</span>
            <p className="text-xl font-black text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
