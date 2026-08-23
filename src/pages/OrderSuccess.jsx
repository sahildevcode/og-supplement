import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Home, ShieldCheck } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 py-16 px-4">
      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/60 animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Order Confirmed</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Thank You For Your Order!</h1>
          <p className="text-sm text-slate-300">
            Your supplement stack is confirmed and preparing for 24-48h express dispatch.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Order ID:</span>
            <span className="font-mono font-bold text-emerald-400">{id || order?.orderId}</span>
          </div>
          {order && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold text-slate-200">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-semibold text-slate-200">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-bold text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-semibold">
            <Truck className="w-4 h-4" />
            <span>Estimated Delivery: 2-3 Business Days</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            View in Order History
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
