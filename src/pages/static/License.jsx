import React from 'react';
import { Award, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export default function License() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Government & Lab Compliance</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Licenses & Certifications</h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            ApexNutra operates under strict compliance with statutory food safety, nutraceutical import, and retail licenses in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">FSSAI Central License</h3>
            </div>
            <p className="text-xs font-mono text-emerald-400 font-bold">Lic. No: 10021064000198</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Approved by the Food Safety and Standards Authority of India (FSSAI) for storage, packaging, and distribution of sports nutrition products.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">GMP Quality Standard</h3>
            </div>
            <p className="text-xs font-mono text-cyan-400 font-bold">Cert. No: GMP-IND-2025-884</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Storage and handling adhere to international Good Manufacturing Practices to ensure consistent quality and microbiological safety.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">GSTIN Registration</h3>
            </div>
            <p className="text-xs font-mono text-amber-400 font-bold">GSTIN: 27AABCA1234F1Z8</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Registered taxpayer issuing 100% genuine tax invoices for every online transaction with full ITC support.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Informed-Choice Verified</h3>
            </div>
            <p className="text-xs font-mono text-purple-400 font-bold">Standard: WADA-Banned Substance Free</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              All performance lines are tested for prohibited doping substances in accordance with WADA guidelines.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
