import React from 'react';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <FileText className="w-4 h-4" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">Terms & Conditions</h1>
          <p className="text-xs text-slate-400 mt-1">Effective Date: January 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Use of Website</h2>
            <p>
              By accessing ApexNutra and purchasing performance dietary supplements, you agree to comply with these terms. You represent that you are at least 18 years of age or accessing under the supervision of a parent/guardian.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Product Authenticity and Descriptions</h2>
            <p>
              We strive to display product formulations, weights, and flavours as accurately as possible. Dietary supplements are not intended to diagnose, treat, cure, or prevent any medical condition. Always consult your physician before starting a high-potency workout stack.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Pricing & Real-Time Stock Availability</h2>
            <p>
              Prices and stock statuses are dynamically synchronized in real time. In the rare event an item is ordered while stock is depleted, our customer support team will immediately offer an equivalent replacement or full refund.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
