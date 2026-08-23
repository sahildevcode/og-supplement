import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';

const categoriesList = [
  {
    name: 'Protein',
    title: 'Whey & Isolate Protein',
    desc: 'Pure muscle synthesis & fast recovery',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80',
    colorDark: 'from-emerald-500/20 to-teal-500/5',
    colorLight: 'from-emerald-100 to-teal-50/50',
    borderDark: 'border-slate-800 group-hover:border-emerald-500/50',
    borderLight: 'border-slate-200 group-hover:border-emerald-500/60 shadow-sm hover:shadow-xl',
  },
  {
    name: 'Mass Gainer',
    title: 'High Calorie Mass Gainers',
    desc: 'Calorie-dense bulking & solid mass',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80',
    colorDark: 'from-purple-500/20 to-indigo-500/5',
    colorLight: 'from-purple-100 to-indigo-50/50',
    borderDark: 'border-slate-800 group-hover:border-purple-500/50',
    borderLight: 'border-slate-200 group-hover:border-purple-500/60 shadow-sm hover:shadow-xl',
  },
  {
    name: 'Creatine',
    title: 'Micronized Creatine',
    desc: 'ATP power, explosive strength & size',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80',
    colorDark: 'from-blue-500/20 to-cyan-500/5',
    colorLight: 'from-blue-100 to-cyan-50/50',
    borderDark: 'border-slate-800 group-hover:border-cyan-500/50',
    borderLight: 'border-slate-200 group-hover:border-cyan-500/60 shadow-sm hover:shadow-xl',
  },
  {
    name: 'Pre-Workout',
    title: 'Energy & Pump Formulas',
    desc: 'High-stim focus & maximum vasodilation',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    colorDark: 'from-amber-500/20 to-orange-500/5',
    colorLight: 'from-amber-100 to-orange-50/50',
    borderDark: 'border-slate-800 group-hover:border-amber-500/50',
    borderLight: 'border-slate-200 group-hover:border-amber-500/60 shadow-sm hover:shadow-xl',
  },
  {
    name: 'Supplements',
    title: 'BCAA & Amino Recovery',
    desc: 'Intra-workout hydration & endurance',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    colorDark: 'from-rose-500/20 to-pink-500/5',
    colorLight: 'from-rose-100 to-pink-50/50',
    borderDark: 'border-slate-800 group-hover:border-rose-500/50',
    borderLight: 'border-slate-200 group-hover:border-rose-500/60 shadow-sm hover:shadow-xl',
  },
  {
    name: 'Vitamins',
    title: 'Daily Multivitamins & Minerals',
    desc: 'Immunity, joints & performance health',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    colorDark: 'from-teal-500/20 to-emerald-500/5',
    colorLight: 'from-teal-100 to-emerald-50/50',
    borderDark: 'border-slate-800 group-hover:border-teal-500/50',
    borderLight: 'border-slate-200 group-hover:border-teal-500/60 shadow-sm hover:shadow-xl',
  }
];

export default function CategorySection() {
  const { setSelectedCategory } = useProducts();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    navigate('/products');
  };

  return (
    <section className={`py-16 sm:py-20 transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 scroll-reveal reveal-active">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
              Browse Collections
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => handleCategoryClick('All')}
            className={`text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors self-start sm:self-auto ${
              isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Explore All Categories <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid with Scroll Reveal Staggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesList.map((cat, idx) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br ${
                isDark ? cat.colorDark : cat.colorLight
              } border ${
                isDark ? cat.borderDark : cat.borderLight
              } p-6 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between min-h-[220px] scroll-reveal reveal-active delay-${(idx % 3 + 1) * 100}`}
            >
              <div className="relative z-10 space-y-2">
                <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isDark ? 'bg-slate-900/90 text-emerald-400 border-slate-700' : 'bg-white/90 text-emerald-700 border-slate-200 shadow-sm'
                }`}>
                  {cat.name}
                </span>
                <h3 className={`text-xl font-extrabold transition-colors ${
                  isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'
                }`}>
                  {cat.title}
                </h3>
                <p className={`text-xs max-w-[200px] ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {cat.desc}
                </p>
              </div>

              {/* Floating Product Render Preview */}
              <div className="absolute -right-4 -bottom-4 w-36 h-36 opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-115 group-hover:-translate-x-2 group-hover:-translate-y-2 pointer-events-none">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                  loading="lazy"
                />
              </div>

              {/* Action Link */}
              <div className="relative z-10 pt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-500 group-hover:text-emerald-600">
                <span>View Products</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
