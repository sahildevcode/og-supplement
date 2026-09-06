import React from 'react';
import { CheckCircle2, Circle, PackageCheck, Truck, Home, Clock, AlertTriangle } from 'lucide-react';

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
      desc: activeIndex >= 3 ? 'Delivered to your doorstep' : `Expected by ${formattedDeliveryDate}`,
      time: activeIndex >= 3 ? 'Delivered' : formattedDeliveryDate,
      icon: Home
    }
  ];

  const isPrepaid = order.paymentMethod === 'Online / UPI' || !!order.transactionId;

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
                <CheckCircle2 className="w-3.5 h-3.5" /> Delivered Successfully
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
                ⚡ PREPAID (ONLINE UPI)
              </span>
              {order.transactionId && (
                <span className="block text-[10px] text-emerald-300 font-mono mt-0.5">
                  UTR: {order.transactionId}
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
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">This order has been cancelled.</p>
            <p className="opacity-80">Reserved items have been returned to warehouse inventory.</p>
          </div>
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
