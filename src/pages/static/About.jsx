import React from 'react';
import { Sparkles, ShieldCheck, Award, Users, CheckCircle2, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Pure Performance Fuel</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">About ApexNutra</h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pioneering pharmaceutical-grade sports nutrition, uncompromised purity, and 100% verified authentic supplements for serious athletes and gym goers.
          </p>
        </div>

        {/* Story Section */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-2xl font-black text-white">Our Mission</h2>
          <p>
            Founded with a singular vision to eradicate counterfeit nutrition in India, ApexNutra partners directly with certified global manufacturers including Optimum Nutrition, MuscleBlaze, Dymatize, and MuscleTech. We ensure every tub, pouch, and tablet has complete traceability from raw whey filtration to doorstep delivery.
          </p>
          <p>
            We believe that clean nutrition should be accessible, transparent, and strictly verified by third-party laboratories. Every single product in our catalog passes rigorous heavy metal and amino spiking screening.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Zero Counterfeit Promise</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct brand sourcing with intact tamper-evident authentication seals and unique QR verification scratch codes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Award className="w-8 h-8 text-cyan-400" />
            <h3 className="text-base font-bold text-white">FSSAI & GMP Certified</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Storage in temperature-controlled warehouses adhering strictly to Good Manufacturing Practices.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <h3 className="text-base font-bold text-white">Real-Time Reliability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live inventory tracking ensures that whatever you see on our storefront is in stock and dispatched within 24 hours.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
