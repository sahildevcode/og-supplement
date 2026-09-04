import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Flame, Award, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function SeoPopularSearches() {
  const { isDark } = useTheme();

  const trendingTags = [
    { label: 'Original Supplement Store', query: '/products' },
    { label: 'Whey Protein Powder', query: '/products?category=Protein' },
    { label: 'MuscleBlaze Creatine', query: '/products?search=MuscleBlaze' },
    { label: 'ON Mass Gainer', query: '/products?search=Optimum+Nutrition' },
    { label: 'Creatine Monohydrate', query: '/products?category=Creatine' },
    { label: 'Optimum Nutrition Gold Standard', query: '/products?search=Gold+Standard' },
    { label: 'Cellucor C4 Pre-Workout', query: '/products?category=Pre-Workout' },
    { label: 'Dymatize ISO 100 Isolate', query: '/products?search=Dymatize' },
    { label: 'MuscleTech NitroTech', query: '/products?search=MuscleTech' },
    { label: 'High Protein Weight Gainer', query: '/products?category=Mass+Gainer' },
    { label: 'BCAA Energy & Recovery', query: '/products?category=Supplements' },
    { label: 'Daily Multivitamins & Immunity', query: '/products?category=Vitamins' },
  ];

  const popularBrands = [
    { name: 'Optimum Nutrition (ON)', desc: 'Gold Standard 100% Whey, Serious Mass Gainer, Micronized Creatine' },
    { name: 'MuscleBlaze (MB)', desc: 'Biozyme Performance Whey, CreAMP Creatine, BCAA Pro' },
    { name: 'MuscleTech', desc: 'NitroTech Whey Gold, Platinum 100% Micronized Creatine' },
    { name: 'Dymatize', desc: 'ISO 100 Hydrolyzed 100% Whey Isolate, Super Mass Gainer' },
    { name: 'Cellucor', desc: 'C4 Original Explosive Pre-Workout Energy Powder' }
  ];

  return (
    <section className={`py-14 border-t transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header with Trending Icon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Indian Fitness Searches</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Popular Supplement Searches & Trending Brands
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Verified Authentic Direct Imports</span>
          </div>
        </div>

        {/* Clickable Trending Search Pills */}
        <div className="flex flex-wrap gap-2.5">
          {trendingTags.map((tag, idx) => (
            <Link
              key={idx}
              to={tag.query}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 active:scale-95 ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span>{tag.label}</span>
            </Link>
          ))}
        </div>

        {/* Trending Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {popularBrands.map((b, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {b.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>

        {/* SEO Explanatory Text for Google Crawlers */}
        <div className={`p-6 rounded-2xl border space-y-3 text-xs leading-relaxed ${
          isDark ? 'bg-slate-900/30 border-slate-800/60 text-slate-400' : 'bg-slate-50/70 border-slate-200 text-slate-600'
        }`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            Why Buy Original Supplements from OG-Supplement India?
          </h3>
          <p>
            At <strong>OG-Supplement</strong>, we are dedicated to providing only <strong>100% Original Supplements</strong> directly from certified brand importers. Whether you are looking for top-tier <strong>Whey Protein</strong> like Optimum Nutrition (ON) Gold Standard, <strong>MuscleBlaze Creatine Monohydrate</strong> for explosive gym power, or heavy-duty <strong>ON Mass Gainer</strong> for lean bulking, every single tub comes with verifiable scratch codes, batch test certificates, and tamper-proof holographic seals.
          </p>
          <div className="flex flex-wrap gap-4 pt-1 font-semibold text-emerald-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> FSSAI Certified</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Official Brand Importer</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Scratch Code Authenticity</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Fast Dispatch Across India</span>
          </div>
        </div>

      </div>
    </section>
  );
}
