import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Terms() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className={`border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Legal Agreement</span>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-400 mt-1">Last Updated: January 2026</p>
        </div>

        {/* Content */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 text-sm leading-relaxed ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Acceptance of Terms</h2>
            <p>
              By accessing OG-Supplement and purchasing performance dietary supplements, you agree to comply with these terms. You represent that you are at least 18 years of age or accessing under the supervision of a parent/guardian.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Health & Dietary Disclaimer</h2>
            <p>
              Products listed on this platform are dietary supplements intended to support exercise performance and daily wellness. They are not intended to diagnose, treat, cure, or prevent any medical condition or disease. Consult a certified healthcare professional before starting any intensive dietary regimen.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Pricing & Real-Time Stock Availability</h2>
            <p>
              All prices listed on OG-Supplement are inclusive of applicable GST taxes. We reserve the right to revise prices, discounts, and inventory allocations without prior notice.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
