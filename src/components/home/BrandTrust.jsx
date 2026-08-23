import React from 'react';
import { ShieldCheck, Award, Truck, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function BrandTrust() {
  const { isDark } = useTheme();

  const features = [
    {
      icon: ShieldCheck,
      title: "100% Authentic Guarantee",
      desc: "Direct sourcing with tamper-proof holographic seals and brand authentication codes.",
      color: "text-emerald-500",
      bgDark: "bg-emerald-500/10 border-emerald-500/20",
      bgLight: "bg-emerald-50 border-emerald-200"
    },
    {
      icon: Award,
      title: "FSSAI & GMP Certified",
      desc: "Every batch is tested for heavy metals, amino spiking, and protein purity.",
      color: "text-cyan-500",
      bgDark: "bg-cyan-500/10 border-cyan-500/20",
      bgLight: "bg-cyan-50 border-cyan-200"
    },
    {
      icon: Truck,
      title: "Free Express Shipping",
      desc: "Complimentary 24-48h dispatch on all orders above ₹999 across 20,000+ pincodes.",
      color: "text-amber-500",
      bgDark: "bg-amber-500/10 border-amber-500/20",
      bgLight: "bg-amber-50 border-amber-200"
    },
    {
      icon: RotateCcw,
      title: "7-Day Easy Returns",
      desc: "100% money back or replacement for damaged, unsealed or mismatched packages.",
      color: "text-rose-500",
      bgDark: "bg-rose-500/10 border-rose-500/20",
      bgLight: "bg-rose-50 border-rose-200"
    }
  ];

  return (
    <section className={`py-12 border-y transition-colors duration-300 ${
      isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-100/70 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 scroll-reveal reveal-active delay-${(i + 1) * 100} ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className={`p-3 rounded-xl ${isDark ? f.bgDark : f.bgLight} border flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{f.title}</h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
