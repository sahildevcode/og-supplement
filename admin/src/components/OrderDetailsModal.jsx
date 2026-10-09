import React, { useState } from 'react';
import { X, CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail, User, RotateCcw, AlertTriangle, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAdminToast } from '../context/AdminToastContext';

export default function OrderDetailsModal({ isOpen, onClose, order, onStatusChange }) {
  const { addToast } = useAdminToast();
  const [currentStatus, setCurrentStatus] = useState(order?.orderStatus || 'Order Placed');
  const [refundStatus, setRefundStatus] = useState(order?.refundStatus || '');
  const [updating, setUpdating] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingRefund, setUpdatingRefund] = useState(false);
  const [showConfirmRefund, setShowConfirmRefund] = useState(false);

  if (!isOpen || !order) return null;

  const handleDelete = async () => {
    const id = order.orderId || order._id;
    if (!window.confirm(`⚠️ Permanently delete Order #${id}?\n\nCustomer: ${order.customerName}\nAmount: ₹${order.totalAmount?.toLocaleString('en-IN')}\n\nThis will remove it completely from the database.`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteOrder(id);
      addToast(`Order #${id} deleted successfully!`, 'success');
      if (onStatusChange) onStatusChange({ ...order, isDeleted: true });
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to delete order', 'error');
    } finally {
      setDeleting(false);
    }
  };

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

  const handleMarkRefundCompleted = async () => {
    setUpdatingRefund(true);
    try {
      const id = order.orderId || order._id;
      const res = await api.updateRefundStatus(id, 'completed');
      setRefundStatus('completed');
      addToast(`🎉 Order #${id} refund marked as 100% Credited to customer!`, 'success');
      if (onStatusChange) {
        onStatusChange(res.order || { ...order, refundStatus: 'completed' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to update refund status', 'error');
    } finally {
      setUpdatingRefund(false);
    }
  };

  const handleRefund = async () => {
    setRefunding(true);
    try {
      const id = order.orderId || order._id;
      const res = await api.refundOrder(id, 'Admin initiated refund from portal');
      addToast(`🎉 ${res.message || 'Refund processed successfully!'}`, 'success');
      setCurrentStatus('Refunded');
      setRefundStatus('completed');
      setShowConfirmRefund(false);
      if (onStatusChange) {
        onStatusChange(res.order || { ...order, orderStatus: 'Refunded', paymentStatus: 'Refunded', refundStatus: 'completed' });
      }
    } catch (err) {
      addToast(err.message || 'Refund failed', 'error');
    } finally {
      setRefunding(false);
    }
  };

  const statuses = ['Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Order ID:</span>
              <span className="font-mono font-black text-cyan-400 text-lg">{order.orderId}</span>
              {(order.paymentMethod?.includes('Razorpay') || order.razorpayPaymentId) ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ⚡ PREPAID (RAZORPAY VERIFIED)
                </span>
              ) : (order.paymentMethod === 'Online / UPI' || order.transactionId) ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ⚡ PREPAID (ONLINE UPI)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  💵 CASH ON DELIVERY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Lifecycle Action Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">Next Lifecycle Action:</span>
            <p className="text-xs text-slate-300 font-bold mt-0.5">
              {currentStatus === 'Order Placed' && 'Customer order received. Click Accept & Pack to notify customer.'}
              {currentStatus === 'Packed' && 'Package is packed and ready for courier dispatch.'}
              {currentStatus === 'Out for Delivery' && 'Package is out with courier partner. Mark Delivered when received.'}
              {currentStatus === 'Delivered' && 'Order successfully delivered to customer!'}
              {currentStatus === 'Cancelled' && 'This order is cancelled.'}
            </p>
          </div>
          {currentStatus === 'Order Placed' && (
            <button
              onClick={() => handleUpdateStatus('Packed')}
              disabled={updating}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Accept & Pack Order</span>
            </button>
          )}
          {currentStatus === 'Packed' && (
            <button
              onClick={() => handleUpdateStatus('Out for Delivery')}
              disabled={updating}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Truck className="w-4 h-4" />
              <span>Mark Out for Delivery</span>
            </button>
          )}
          {currentStatus === 'Out for Delivery' && (
            <button
              onClick={() => handleUpdateStatus('Delivered')}
              disabled={updating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Delivered</span>
            </button>
          )}
        </div>

        {/* Live Status Switcher Chips */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">All Order Status Options:</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => handleUpdateStatus(st)}
                disabled={updating || currentStatus === st}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Payment Mode: <span className="font-bold text-white">{order.paymentMethod}</span></p>
            <p className="text-xs text-slate-400">Status: <span className="font-bold text-cyan-400">{order.paymentStatus || 'Pending'}</span></p>
            {order.transactionId && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg inline-flex mt-1">
                <span>UTR / Ref: {order.transactionId}</span>
              </div>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Grand Total</p>
            <p className="text-xl font-black text-white font-mono">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Instant Razorpay Refund Action & Tracking Card */}
        {currentStatus === 'Refunded' || order.paymentStatus === 'Refunded' || order.refundAmount > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  refundStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {refundStatus === 'completed' ? <CheckCircle className="w-5 h-5" /> : <RotateCcw className="w-5 h-5 animate-spin" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Refund Tracking
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      refundStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {refundStatus === 'completed' ? '✅ 100% Credited to Bank' : '🔄 Processing by Bank (2-4 Days)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Amount: <strong className="text-white">₹{order.refundAmount || order.totalAmount}</strong>
                    {order.cancellationFee > 0 && <span className="text-slate-400 ml-1.5">(Handling Fee Retained: ₹{order.cancellationFee})</span>}
                  </p>
                  {order.refundId && (
                    <span className="font-mono text-cyan-400 block text-[11px] mt-0.5">
                      Razorpay Refund ID: {order.refundId}
                    </span>
                  )}
                </div>
              </div>

              {refundStatus !== 'completed' && (
                <button
                  type="button"
                  onClick={handleMarkRefundCompleted}
                  disabled={updatingRefund}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{updatingRefund ? 'Updating...' : 'Mark 100% Credited'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (order.paymentStatus === 'Paid' || order.paymentMethod?.includes('Razorpay') || order.transactionId?.startsWith('pay_')) ? (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-400">
                  <RotateCcw className="w-4 h-4" />
                  <span>Customer Refund Control</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Agar customer ne order cancel kiya hai, to yahan se 1-click me Razorpay se paise wapas bhej sakte hain.
                </p>
              </div>

              {!showConfirmRefund && (
                <button
                  type="button"
                  onClick={() => setShowConfirmRefund(true)}
                  disabled={refunding}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refund Customer (₹{order.totalAmount})</span>
                </button>
              )}
            </div>

            {/* Confirmation Alert */}
            {showConfirmRefund && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-slate-200">
                    Confirm: Kya aap <strong className="text-white">₹{order.totalAmount}</strong> customer <strong className="text-white">({order.customerName})</strong> ke account me wapas refund karna chahte hain?
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowConfirmRefund(false)}
                    disabled={refunding}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRefund}
                    disabled={refunding}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${refunding ? 'animate-spin' : ''}`} />
                    <span>{refunding ? 'Refunding...' : 'Yes, Send Refund'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Deleting Order...' : 'Delete Order'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
