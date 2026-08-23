import React from 'react';
import { Truck, Clock, ShieldCheck } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <Truck className="w-4 h-4" />
            <span>Fast Logistics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">Shipping & Delivery Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Direct from Climate-Controlled Warehouses</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Shipping Charges & Free Delivery Threshold</h2>
            <p>
              We provide <strong>FREE Express Shipping</strong> across India on all orders of ₹999 or higher. For orders below ₹999, a flat delivery fee of ₹99 applies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Dispatch & Delivery Timelines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-white text-xs uppercase tracking-wider">Metro Cities</p>
                <p className="text-xl font-black text-emerald-400">24 – 48 Hours</p>
                <p className="text-xs text-slate-400">Mumbai, Delhi NCR, Bangalore, Pune, Hyderabad, Chennai</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-white text-xs uppercase tracking-wider">Rest of India</p>
                <p className="text-xl font-black text-cyan-400">2 – 4 Business Days</p>
                <p className="text-xs text-slate-400">20,000+ serviceable tier 2 and tier 3 pincodes</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Tamper-Proof Packaging</h2>
            <p>
              Every supplement is sealed inside heavy-duty multi-layer bubble wrap with tamper-evident security tape to ensure safety and temperature stability during transport.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
