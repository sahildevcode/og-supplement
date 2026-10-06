import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function HomeTransformations() {
  const { isDark } = useTheme();

  const previewTransformations = [
    {
      name: 'Aman Deep Sharma',
      city: 'Delhi NCR',
      gain: '+5.8 KG Lean Muscle',
      product: 'NitroTech Whey Gold',
      duration: '16 Weeks',
      before: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80',
      after: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
      quote: 'Mixability is super smooth, no bloating. Bench increased to 95kg with 100% genuine supplements.'
    },
    {
      name: 'Rohit Kulkarni',
      city: 'Pune',
      gain: '-7.4 KG Fat Loss',
      product: 'ON 100% Whey Isolate',
      duration: '12 Weeks',
      before: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=80',
      after: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
      quote: 'Importer hologram code verified instantly. Recovery after 5 AM fasted cardio is unbelievable.'
    },
    {
      name: 'Priya Rathore',
      city: 'Jaipur',
      gain: '+15 KG Deadlift PR',
      product: 'Creatine Monohydrate',
      duration: '8 Weeks',
      before: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
      after: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80',
      quote: 'Zero bloat, instant stamina spike on leg days without stomach cramps. Fast delivery!'
    }
  ];

  return (
    <section className={`py-16 sm:py-20 border-t border-b transition-colors duration-300 ${
      isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Proven Results • 10,000+ Happy Customers</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Real Customer Transformations
            </h2>
          </div>

          <Link
            to="/reviews"
            className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors self-start sm:self-auto"
          >
            <span>View All Reviews & Results</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Transformation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewTransformations.map((t) => (
            <div
              key={t.name}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:border-emerald-500/40 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              {/* Before / After Photo Comparison */}
              <div className="grid grid-cols-2 gap-1 p-2 bg-slate-950">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                  <img src={t.before} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-black/80 text-slate-300">
                    Before
                  </span>
                </div>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                  <img src={t.after} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-black">
                    {t.duration}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{t.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {t.gain}
                  </span>
                </div>

                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  "{t.quote}"
                </p>

                <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span className="text-slate-500">Used:</span>{' '}
                  <span className="text-emerald-400 font-semibold">{t.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
