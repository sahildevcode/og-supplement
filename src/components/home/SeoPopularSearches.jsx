import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Flame, Award, CheckCircle2, TrendingUp, Sparkles, BookOpen, HelpCircle, Target } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function SeoPopularSearches() {
  const { isDark } = useTheme();

  // 1 & 2. Core Official + High-Intent Buying Keywords
  const trendingTags = [
    { label: 'OG Supplement official site', query: '/products' },
    { label: 'Buy OG Supplement online', query: '/products' },
    { label: 'Original health supplements India', query: '/products' },
    { label: 'Best gym supplements online', query: '/products' },
    { label: 'Buy authentic whey protein online', query: '/products?category=Protein' },
    { label: 'Best whey protein for muscle gain', query: '/products?category=Protein' },
    { label: 'Buy authentic mass gainer online', query: '/products?category=Mass+Gainer' },
    { label: 'Pre-workout supplement for energy', query: '/products?category=Pre-Workout' },
    { label: 'Creatine monohydrate online purchase', query: '/products?category=Creatine' },
    { label: 'Multivitamin tablets for gym workout', query: '/products?category=Vitamins' },
    { label: 'BCAA powder for muscle recovery', query: '/products?search=BCAA' },
    { label: 'Plant protein powder online India', query: '/products?category=Protein' },
  ];

  // 3. Problem-Solving & Goal-Based Keywords
  const goalBasedKeywords = [
    { label: 'Best supplement for fast weight gain', query: '/products?category=Mass+Gainer' },
    { label: 'Supplements for fat loss and muscle retention', query: '/products?category=Protein' },
    { label: 'How to gain weight naturally for men/women', query: '/products?category=Mass+Gainer' },
    { label: 'Best supplement for stamina and strength', query: '/products?category=Creatine' },
    { label: 'Post-workout recovery supplements', query: '/products?category=Protein' },
  ];

  // 4. Hindi & Hinglish Search Keywords (Indian Audience)
  const hinglishKeywords = [
    { label: 'Original supplement kaise khareede', query: '/products' },
    { label: 'Weight gain ke liye sabse accha supplement', query: '/products?category=Mass+Gainer' },
    { label: 'Gym ke liye konsa protein powder accha hai', query: '/products?category=Protein' },
    { label: 'Best body building supplement store', query: '/products' },
    { label: 'Sasta aur achha protein powder online', query: '/products?category=Protein' },
  ];

  // 5. Long-Tail Keywords (Blog & Content Strategy Guides)
  const blogArticles = [
    {
      title: 'How to check if protein supplement is authentic or fake',
      desc: 'Original supplement kaise khareede: Always verify the official importer holographic seal, FSSAI license number, batch scratch code on the brand website, and GST tax invoice from OG Supplement official site.',
      link: '/products?category=Protein',
      badge: 'Authenticity Guide'
    },
    {
      title: 'Top 5 supplements beginners should take for gym',
      desc: 'Gym ke liye konsa protein powder accha hai: Beginners should start with 1) Best whey protein for muscle gain, 2) Creatine monohydrate for stamina and strength, 3) Multivitamin tablets for gym workout, 4) BCAA powder for muscle recovery, and 5) Pre-workout supplement for energy.',
      link: '/products',
      badge: 'Beginner Stack'
    },
    {
      title: 'Whey protein vs Mass gainer difference',
      desc: 'Whey protein delivers high pure protein with low carbs for lean muscle retention and fat loss, while an authentic mass gainer provides high calories and complex carbs — the best supplement for fast weight gain naturally for men & women.',
      link: '/products?category=Mass+Gainer',
      badge: 'Goal Comparison'
    },
    {
      title: 'Side effects of taking pre-workout on empty stomach',
      desc: 'Pre-workout supplement for energy contains caffeine and beta-alanine for explosive focus. Taking it on an empty stomach may cause mild tingling or acidity — consume 20-30 mins after a light snack with 250ml water for best gym performance.',
      link: '/products?category=Pre-Workout',
      badge: 'Safety & Usage'
    }
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
              <span>OG Supplement Official Site — India's #1 Fitness Store</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Popular Supplement Searches, Fitness Goals & Buying Guides
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Verified Authentic Direct Imports</span>
          </div>
        </div>

        {/* 1 & 2. High-Intent Buying & Official Store Keywords */}
        <div className="space-y-3">
          <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>High-Intent Supplement Searches</span>
          </h3>
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* 3 & 4. Goal-Based + Hindi/Hinglish Searches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goal-Based Keywords */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              <Target className="w-4 h-4" />
              <span>Goal-Based Fitness Searches (Weight Gain, Fat Loss & Stamina)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {goalBasedKeywords.map((tag, idx) => (
                <Link
                  key={idx}
                  to={tag.query}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-600 hover:text-emerald-600'
                  }`}
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Hindi & Hinglish Search Keywords */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              <HelpCircle className="w-4 h-4" />
              <span>Popular Indian & Hinglish Fitness Searches</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {hinglishKeywords.map((tag, idx) => (
                <Link
                  key={idx}
                  to={tag.query}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-cyan-500 hover:text-cyan-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-cyan-600 hover:text-cyan-600'
                  }`}
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Long-Tail Blog & Expert Supplement Strategy Guides */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Expert Supplement Guides & Fitness Knowledge Hub
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogArticles.map((article, idx) => (
              <Link
                key={idx}
                to={article.link}
                className={`p-5 rounded-2xl border transition-all group block ${
                  isDark
                    ? 'bg-slate-900/50 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {article.badge}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
                    Explore Products →
                  </span>
                </div>
                <h4 className={`text-sm font-black group-hover:text-emerald-400 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {article.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {article.desc}
                </p>
              </Link>
            ))}
          </div>
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
            OG Supplement Official Site — Buy Original Health Supplements in India
          </h3>
          <p>
            Welcome to the <strong>OG Supplement official site</strong>, India's most trusted <strong>best body building supplement store</strong> where you can <strong>buy OG Supplement online</strong> with 100% authenticity guarantee. Whether you are searching for the <strong>best whey protein for muscle gain</strong>, want to <strong>buy authentic whey protein online</strong>, or need to <strong>buy authentic mass gainer online</strong> as the <strong>best supplement for fast weight gain</strong>, we source directly from official importers.
          </p>
          <p>
            Our catalog includes <strong>pre-workout supplement for energy</strong>, <strong>creatine monohydrate online purchase</strong> for <strong>stamina and strength</strong>, <strong>multivitamin tablets for gym workout</strong>, <strong>BCAA powder for muscle recovery</strong>, <strong>plant protein powder online India</strong>, and <strong>supplements for fat loss and muscle retention</strong>. Agar aap soch rahe hain ki <em>original supplement kaise khareede</em>, <em>weight gain ke liye sabse accha supplement</em> kaunsa hai, ya <em>gym ke liye konsa protein powder accha hai</em> — OG-Supplement par aapko milta hai <em>sasta aur achha protein powder online</em> with scratch-code verification and GST billing.
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
