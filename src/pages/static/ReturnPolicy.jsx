import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <RotateCcw className="w-4 h-4" />
            <span>Buyer Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">Return & Refund Policy</h1>
          <p className="text-xs text-slate-400 mt-1">7 Days Hassle-Free Replacement Guarantee</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Eligible Return Scenarios</h2>
            <p>
              We provide full refunds or replacements for any product received in the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-300">
              <li>Product tub or pouch seal was broken or compromised during transit.</li>
              <li>Incorrect product variant, size, or flavor delivered.</li>
              <li>Product has passed or is near its expiration date.</li>
              <li>Damaged or leaking packaging.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Return Window</h2>
            <p>
              Return requests must be initiated within <strong>7 days</strong> of delivery through our customer care or by emailing <a href="mailto:support@apexnutra.com" className="text-emerald-400 font-bold hover:underline">support@apexnutra.com</a> with your order ID and unboxing photo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Refund Timeline</h2>
            <p>
              Once approved, refunds are credited back to the original payment source within 3-5 business days. For Cash on Delivery orders, refunds are issued via direct UPI or bank transfer.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
