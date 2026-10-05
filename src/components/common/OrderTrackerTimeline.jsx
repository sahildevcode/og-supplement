import React from 'react';
import { CheckCircle2, Circle, PackageCheck, Truck, Home, Clock, AlertTriangle, RotateCcw, Mail, HelpCircle, Check, XCircle } from 'lucide-react';

export default function OrderTrackerTimeline({ order, isDark = true }) {
  if (!order) return null;

  const isCancelled = order.orderStatus === 'Cancelled';
  const orderDate = new Date(order.createdAt || Date.now());
  const deliveryDate = new Date(orderDate.getTime() + (2 * 24 * 60 * 60 * 1000));
  
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const formattedOrderTime = orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate active stage index (0 to 3)
  // 0: Order Placed
  // 1: Packed / Processing
  // 2: Out for Delivery / Shipped
  // 3: Delivered
  let activeIndex = 0;
  if (order.orderStatus === 'Packed' || order.orderStatus === 'Processing') {
    activeIndex = 1;
  } else if (order.orderStatus === 'Out for Delivery' || order.orderStatus === 'Shipped') {
    activeIndex = 2;
  } else if (order.orderStatus === 'Delivered') {
    activeIndex = 3;
  }

  const steps = [
    {
      id: 0,
      title: 'Order Placed',
      desc: 'Your order has been placed',
      time: formattedOrderTime,
      icon: Clock
    },
    {
      id: 1,
      title: 'Packed',
      desc: activeIndex >= 1 ? 'Your package has been packed & placed' : 'Item being packed at warehouse',
      time: activeIndex >= 1 ? 'Packed & verified' : 'Within 24 hours',
      icon: PackageCheck
    },
    {
      id: 2,
      title: 'Out for Delivery',
      desc: activeIndex >= 2 ? 'Out for delivery with courier partner' : 'Courier express transit',
      time: activeIndex >= 2 ? 'Out for delivery' : 'Expected in 2 days',
      icon: Truck
    },
    {
      id: 3,
      title: 'Delivered',
      desc: activeIndex >= 3 ? 'Your product has been delivered today' : `Expected by ${formattedDeliveryDate}`,
      time: activeIndex >= 3 ? 'Delivered Today' : formattedDeliveryDate,
      icon: Home
    }
  ];

  const isRazorpay = order.paymentMethod?.includes('Razorpay') || !!order.razorpayPaymentId;
  const isPrepaid = isRazorpay || order.paymentMethod === 'Online / UPI' || !!order.transactionId;
  const paymentRef = order.razorpayPaymentId || order.transactionId;

  return (
    <div className={`p-5 sm:p-7 rounded-3xl border transition-all ${
      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Tracker Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-6 border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isCancelled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Order Cancelled
              </span>
            ) : activeIndex === 3 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Your product has been delivered today
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/40 animate-pulse">
                  <Truck className="w-3.5 h-3.5" /> Arriving in 2 Days — by {formattedDeliveryDate}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Order ID: <span className="font-mono font-bold text-cyan-400">{order.orderId}</span>
          </p>
        </div>

        {/* Payment Tag */}
        <div className="flex items-center gap-2">
          {isPrepaid ? (
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isRazorpay ? '⚡ PREPAID (RAZORPAY VERIFIED)' : '⚡ PREPAID (ONLINE UPI)'}
              </span>
              {paymentRef && (
                <span className="block text-[10px] text-emerald-300 font-mono mt-0.5">
                  {order.razorpayPaymentId ? `ID: ${order.razorpayPaymentId}` : `UTR: ${order.transactionId}`}
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              💵 CASH ON DELIVERY (COD)
            </span>
          )}
        </div>
      </div>

      {/* If Cancelled */}
      {isCancelled ? (
        <div className="space-y-4">
          {/* For Prepaid Orders with Refund */}
          {isPrepaid && (order.refundAmount > 0 || order.refundId || order.paymentStatus === 'Refunded' || order.cancellationFee > 0) ? (() => {
            const isCompleted = order.refundStatus === 'completed';
            const refundAmt = order.refundAmount || order.totalAmount;
            const feeAmt = order.cancellationFee || 0;
            const cancelledDate = order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) : formattedOrderTime;

            const refundSteps = [
              {
                id: 0,
                title: 'Refund Initiated',
                desc: 'Submitted via Razorpay',
                time: cancelledDate,
                done: true,
                current: false
              },
              {
                id: 1,
                title: 'Processing by Bank',
                desc: isCompleted ? 'Bank verified & approved' : 'UPI / Bank clearing in progress',
                time: isCompleted ? 'Completed' : 'Expected in 2 to 4 business days',
                done: isCompleted,
                current: !isCompleted
              },
              {
                id: 2,
                title: 'Refund Credited',
                desc: isCompleted ? `₹${refundAmt} credited to your account` : 'Awaiting final bank settlement',
                time: isCompleted ? '100% Credited' : 'Pending Bank Clearance',
                done: isCompleted,
                current: false
              }
            ];

            return (
              <div className="space-y-5">
                {/* Status Alert Banner */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <RotateCcw className="w-5 h-5 animate-spin" />}
                    </div>
                    <div>
                      <p className="font-black text-sm text-white">
                        {isCompleted
                          ? `₹${refundAmt} Successfully Credited to Bank Account`
                          : `Refund of ₹${refundAmt} is in Process`}
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {isCompleted
                          ? 'Bank has cleared this refund. Funds have been returned to your original payment method.'
                          : 'Refund has been initiated. It usually reflects within 2 to 4 business days depending on your bank.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Refund</p>
                    <p className="font-mono font-black text-lg text-emerald-400">₹{refundAmt}</p>
                    {feeAmt > 0 && (
                      <span className="text-[10px] text-slate-400 block">
                        (Handling fee deducted: ₹{feeAmt})
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-Stage Horizontal Stepper */}
                <div className="relative py-2 px-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {refundSteps.map((st, idx) => (
                      <div
                        key={st.id}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                          st.done
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
                            : st.current
                            ? 'bg-amber-950/20 border-amber-500/40 text-white ring-1 ring-amber-500/30'
                            : (isDark ? 'bg-slate-950/50 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          st.done
                            ? 'bg-emerald-500 text-black'
                            : st.current
                            ? 'bg-amber-500 text-black animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {st.done ? <Check className="w-4 h-4 font-black" /> : idx + 1}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold text-xs">{st.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{st.desc}</p>
                          <p className={`text-[10px] font-bold ${st.done ? 'text-emerald-400' : st.current ? 'text-amber-400' : 'text-slate-500'}`}>
                            {st.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Support & Help Box */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Need Help with your Refund?
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Agar 2 se 4 business days me refund aapke account me na dikhe, toh direct hamari support team se contact karein:
                      </p>
                    </div>
                  </div>

                  <a
                    href={`mailto:sk7161853@gmail.com?subject=Refund%20Status%20Inquiry%20for%20Order%20%23${order.orderId}&body=Hello%20Support%20Team%2C%0A%0AMy%20order%20%23${order.orderId}%20was%20cancelled%20and%20I%20would%20like%20to%20check%20the%20status%20of%20my%20refund%20of%20%E2%82%B9${refundAmt}.%0A%0ARefund%20ID%3A%20${order.refundId || 'N%2FA'}%0A%0AThank%20you.`}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>sk7161853@gmail.com</span>
                  </a>
                </div>
              </div>
            );
          })() : (
            /* Cash on Delivery (COD) Cancelled Box */
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white text-sm">Order Cancelled</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Cash on Delivery (COD) order — koi advance payment nahi kiya gaya tha. Zero cancellation charges apply.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Flipkart 4-Stage Stepper */
        <div className="space-y-6">
          {/* Desktop & Tablet Progress Bar */}
          <div className="relative hidden sm:block py-4 px-2">
            {/* Background Line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 h-1.5 bg-slate-800 rounded-full" />
            
            {/* Completed Line Fill */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-8 h-1.5 bg-emerald-500 rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/50"
              style={{
                width: `calc(${(activeIndex / (steps.length - 1)) * 100}% - 16px)`
              }}
            />

            {/* Stepper Nodes */}
            <div className="relative flex justify-between">
              {steps.map((step) => {
                const isCompleted = step.id <= activeIndex;
                const isCurrent = step.id === activeIndex;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex flex-col items-center text-center max-w-[140px]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                        isCompleted
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 scale-105 ring-4 ring-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
                      } ${isCurrent ? 'animate-bounce-subtle' : ''}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 font-black" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="mt-3 space-y-0.5">
                      <p className={`text-xs font-black tracking-tight ${
                        isCompleted ? 'text-white' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {step.desc}
                      </p>
                      <p className={`text-[10px] font-bold ${
                        isCompleted ? 'text-emerald-400' : 'text-slate-600'
                      }`}>
                        {step.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Stepper */}
          <div className="sm:hidden space-y-4 relative pl-3">
            {/* Vertical Line */}
            <div className="absolute top-4 bottom-4 left-6 w-1 bg-slate-800 -z-0" />
            <div
              className="absolute top-4 left-6 w-1 bg-emerald-500 transition-all duration-500 -z-0 shadow-sm shadow-emerald-500/50"
              style={{
                height: `${(activeIndex / (steps.length - 1)) * 100}%`
              }}
            />

            {steps.map((step) => {
              const isCompleted = step.id <= activeIndex;
              const isCurrent = step.id === activeIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-start gap-4 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="space-y-0.5 pb-2">
                    <p className={`text-xs font-black ${isCompleted ? 'text-white' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {step.desc}
                    </p>
                    <p className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {step.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
