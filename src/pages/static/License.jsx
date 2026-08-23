import React from 'react';
import { Award, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function License() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 sm:py-16 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto border border-cyan-500/20">
            <Award className="w-6 h-6" />
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Licenses & Statutory Certifications
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            OG-Supplement operates under strict compliance with statutory food safety, nutraceutical import, and retail licenses in India.
          </p>
        </div>

        {/* License Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500">License 01</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">Verified</span>
            </div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>FSSAI Central Food Safety License</h3>
            <p className="text-xs font-mono text-emerald-500 font-bold">Lic. No: 10024011009842</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Certified for storage, import and online distribution of sports nutrition, protein supplements and dietary vitamins.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-500">License 02</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">GMP Compliant</span>
            </div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Good Manufacturing Practice (GMP)</h3>
            <p className="text-xs font-mono text-cyan-500 font-bold">Registration: GMP-IND-2026-990</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Climate-controlled warehousing adhering to WHO-GMP standards for hygroscopic powders and heat-sensitive amino acids.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-amber-500">License 03</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">NABL Accredited</span>
            </div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>NABL Lab Testing Protocol</h3>
            <p className="text-xs font-mono text-amber-500 font-bold">Standard: ISO/IEC 17025</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every production lot undergoes mandatory Kjeldahl protein nitrogen verification and heavy metal profiling.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-purple-500">License 04</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/30">Authorized Partner</span>
            </div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Brand Importer Agreements</h3>
            <p className="text-xs font-mono text-purple-500 font-bold">Authorized Direct Distributor</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct distribution agreements with official Indian importers for Optimum Nutrition, Dymatize, MuscleTech and Cellucor.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
