import React from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ReturnPolicy() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className={`border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Customer Protection</span>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Return & Refund Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">7-Day Free Replacement & Return Guarantee</p>
        </div>

        {/* Content */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 text-sm leading-relaxed ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>1. 7-Day Return Eligibility</h2>
            <p>
              We want you to be 100% satisfied with your supplement purchase. You may request a return or replacement within <strong>7 days</strong> of delivery if:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>The outer security seal or brand hologram is broken upon arrival.</li>
              <li>The package is damaged in transit or leaking.</li>
              <li>You received a different flavor, size, or variant than what was ordered.</li>
              <li>The product has passed its stated expiration date.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Non-Returnable Scenarios</h2>
            <p>
              Due to strict health and safety standards for consumable sports nutrition:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Tubs with opened inner seal or partially consumed powders cannot be returned unless verified defective.</li>
              <li>Issues arising from personal taste preferences or subjective flavor feedback.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>3. How to Initiate a Return</h2>
            <p>
              Return requests must be initiated within <strong>7 days</strong> of delivery through our customer care or by emailing <a href="mailto:support@ogsupplement.com" className="text-emerald-500 font-bold hover:underline">support@ogsupplement.com</a> with your order ID and unboxing photo.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
