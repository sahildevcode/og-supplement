import React from 'react';
import { XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function CancellationPolicy() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm leading-relaxed ${
        isDark ? 'text-slate-300' : 'text-slate-700'
      }`}>
        
        <div className={`border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
            isDark ? 'text-rose-400' : 'text-rose-700'
          }`}>
            <XCircle className="w-4 h-4" />
            <span>Order Cancellation</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Cancellation Policy</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Simple & Transparent Terms</p>
        </div>

        <div className={`p-8 rounded-3xl border space-y-6 ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <section className="space-y-2">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Cancellation Prior to Dispatch</h2>
            <p>
              You can cancel your order at any time before it has been dispatched from our warehouse. Upon cancellation, the order will be stopped immediately. Please note that as per our policy, we do not provide cash or money refunds.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Automatic Stock Restoration</h2>
            <p>
              When an order is cancelled, our real-time inventory management system automatically restores the reserved supplement units back to the live customer catalog.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Cancellation After Dispatch</h2>
            <p>
              Once an order is in transit with the courier partner, it cannot be cancelled or refunded. Please ensure your delivery details and order selections are correct before dispatch.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
