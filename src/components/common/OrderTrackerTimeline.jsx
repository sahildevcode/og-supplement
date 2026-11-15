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
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-6 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isCancelled ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                isDark ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5" /> Order Cancelled
              </span>
            ) : activeIndex === 3 ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Your product has been delivered today
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-sm ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-950/40 animate-pulse' : 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                }`}>
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Arriving in 2 Days — by {formattedDeliveryDate}
                </span>
              </div>
            )}
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            Order ID: <span className="font-mono font-bold text-cyan-500 dark:text-cyan-400">{order.orderId}</span>
          </p>
        </div>

        {/* Payment Tag */}
        <div className="flex items-center gap-2">
          {isPrepaid ? (
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isRazorpay ? '⚡ PREPAID (RAZORPAY VERIFIED)' : '⚡ PREPAID (ONLINE UPI)'}
              </span>
              {paymentRef && (
                <span className={`block text-[10px] font-mono mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700 font-bold'}`}>
                  {order.razorpayPaymentId ? `ID: ${order.razorpayPaymentId}` : `UTR: ${order.transactionId}`}
                </span>
              )}
            </div>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
              isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-800 border-slate-300'
            }`}>
              💵 CASH ON DELIVERY (COD)
            </span>
          )}
        </div>
      </div>

      {/* If Cancelled */}
      {isCancelled ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white text-sm">Order Cancelled</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  This order was cancelled prior to warehouse dispatch. Need assistance or replacement inquiry?
                </p>
              </div>
            </div>

            <a
              href={`mailto:sk7161853@gmail.com?subject=Inquiry%20for%20Cancelled%20Order%20%23${order.orderId}&body=Hello%20OG-Supplement%20Team%2C%0A%0AMy%20order%20%23${order.orderId}%20was%20cancelled.%20I%20have%20a%20query%20regarding%20this.%0A%0AThank%20you.`}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      ) : (
        /* Flipkart 4-Stage Stepper */
        <div className="space-y-6">
          {/* Desktop & Tablet Progress Bar */}
          <div className="relative hidden sm:block pt-3 pb-6 px-4">
            {/* Background Line (Positioned exactly through the center of 40px circle: top is 20px) */}
            <div className={`absolute top-8 left-12 right-12 h-1.5 rounded-full ${
              isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`} />
            
            {/* Completed Line Fill (Positioned exactly through the center of 40px circle) */}
            <div
              className="absolute top-8 left-12 h-1.5 bg-emerald-500 rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/50"
              style={{
                width: `calc(${(activeIndex / (steps.length - 1)) * 100}% - 24px)`
              }}
            />

            {/* Stepper Nodes */}
            <div className="relative flex justify-between">
              {steps.map((step) => {
                const isCompleted = step.id <= activeIndex;
                const isCurrent = step.id === activeIndex;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex flex-col items-center text-center max-w-[150px]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105 ring-4 ring-emerald-500/20'
                          : isDark
                          ? 'bg-slate-800 text-slate-500 border-2 border-slate-700'
                          : 'bg-slate-100 text-slate-400 border-2 border-slate-300'
                      } ${isCurrent ? 'animate-bounce-subtle' : ''}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 font-black text-white" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="mt-4 space-y-1">
                      <p className={`text-xs font-black tracking-tight leading-snug ${
                        isCompleted
                          ? isDark ? 'text-white' : 'text-slate-900'
                          : isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className={`text-[11px] leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {step.desc}
                      </p>
                      <p className={`text-[10px] font-bold ${
                        isCompleted
                          ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                          : isDark ? 'text-slate-600' : 'text-slate-400'
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
            <div className={`absolute top-4 bottom-4 left-6 w-1 -z-0 ${
              isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`} />
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
                        ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                        : isDark
                        ? 'bg-slate-800 text-slate-500 border border-slate-700'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="space-y-0.5 pb-2">
                    <p className={`text-xs font-black ${
                      isCompleted
                        ? isDark ? 'text-white' : 'text-slate-900'
                        : isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-[11px] leading-snug ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {step.desc}
                    </p>
                    <p className={`text-[10px] font-bold ${
                      isCompleted
                        ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                        : isDark ? 'text-slate-600' : 'text-slate-400'
                    }`}>
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
