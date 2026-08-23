import React from 'react';
import { XCircle } from 'lucide-react';

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-400">
            <XCircle className="w-4 h-4" />
            <span>Order Cancellation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">Cancellation Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Simple & Transparent Terms</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Cancellation Prior to Dispatch</h2>
            <p>
              You can cancel your order free of charge at any time before it has been dispatched from our warehouse. Upon cancellation, your payment will be refunded immediately without any cancellation penalties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Automatic Stock Restoration</h2>
            <p>
              When an order is cancelled, our real-time inventory management system automatically restores the reserved supplement units back to the live customer catalog via Socket.IO.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Cancellation After Dispatch</h2>
            <p>
              Once an order is in transit with the courier partner, it cannot be directly cancelled. You can simply decline the package at doorstep upon delivery, and a full refund will be initiated once the package returns to our facility.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
