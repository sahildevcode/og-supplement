import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last Updated: January 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              When you purchase sports nutrition products or register on ApexNutra, we collect personal information such as your name, shipping address, contact telephone number, and email address. This information is used strictly to process orders and provide delivery updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Payment Security</h2>
            <p>
              We do NOT store credit card or debit card numbers on our servers. All digital transactions are processed through RBI-authorized payment gateways featuring 256-bit SSL encryption and dual-factor authentication.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Cookies and Real-Time Session Data</h2>
            <p>
              We use session cookies and local storage to retain your shopping cart items, preferred variants, and real-time Socket.IO connection state between page views.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Third-Party Sharing</h2>
            <p>
              We never sell or rent your personal information to third-party marketers. Data is shared solely with trusted logistics partners (e.g. BlueDart, Delhivery) to facilitate express delivery.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
