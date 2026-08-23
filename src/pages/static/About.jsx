import React from 'react';
import { ShieldCheck, Award, Users, Target, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function About() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
            Our Purpose & Promise
          </span>
          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            About OG-Supplement
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Empowering athletes, bodybuilders, and fitness enthusiasts across India with 100% authentic, high-potency sports nutrition.
          </p>
        </div>

        {/* Brand Mission Card */}
        <div className={`p-8 rounded-3xl border space-y-4 shadow-xl ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Zero Compromise on Authenticity</h2>
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Founded with a singular vision to eradicate counterfeit nutrition in India, OG-Supplement partners directly with certified global manufacturers including Optimum Nutrition, MuscleBlaze, Dymatize, and MuscleTech. We ensure every tub, pouch, and tablet has complete traceability from raw whey filtration to doorstep delivery.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Direct Importer Sourcing</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We eliminate third-party middle-men. Every item comes with original importer holographic seals (GMC, Bright, Glanbia).
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 w-fit">
              <Award className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>NABL Accredited Testing</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Random batch laboratory certificates ensuring protein content claims match exactly with real testing data.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 w-fit">
              <Target className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Real-Time Inventory Control</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Powered by real-time WebSocket inventory sync, guaranteeing that what you buy is fresh and available in warehouse.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Expert Nutrition Advisory</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Access guidance on personalized stacks whether you want pure lean hypertrophy, explosive endurance, or clean bulking.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
