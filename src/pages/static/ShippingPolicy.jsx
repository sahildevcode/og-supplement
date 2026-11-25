import React from 'react';
import { Truck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ShippingPolicy() {
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
            isDark ? 'text-cyan-400' : 'text-cyan-700'
          }`}>
            <Truck className="w-4 h-4" />
            <span>Fast Logistics</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Shipping & Delivery Policy</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Direct from Climate-Controlled Warehouses</p>
        </div>

        <div className={`p-8 rounded-3xl border space-y-6 ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <section className="space-y-2">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Always 100% Free Express Shipping</h2>
            <p>
              We provide <strong>100% FREE Express Shipping</strong> across all 20,000+ pin codes in India on <strong>every order</strong>. There is absolutely no minimum order value required—delivery is always ₹0 FREE!
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Dispatch & Delivery Timelines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Metro Cities</p>
                <p className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>24 – 48 Hours</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Mumbai, Delhi NCR, Bangalore, Pune, Hyderabad, Chennai</p>
              </div>
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Rest of India</p>
                <p className={`text-xl font-black ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>2 – 4 Business Days</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>20,000+ serviceable tier 2 and tier 3 pincodes</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Tamper-Proof Packaging</h2>
            <p>
              Every supplement is sealed inside heavy-duty multi-layer bubble wrap with tamper-evident security tape to ensure safety and temperature stability during transport.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
