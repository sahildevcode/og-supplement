import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { socket } from '../../services/socket';

const themePresets = {
  emerald: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    glow: 'from-emerald-500/30 via-teal-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-emerald-500/60 shadow-emerald-950/20',
    btnBg: 'group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500',
    titleHover: 'group-hover:text-emerald-400',
  },
  purple: {
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
    glow: 'from-purple-500/30 via-indigo-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-purple-500/60 shadow-purple-950/20',
    btnBg: 'group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500',
    titleHover: 'group-hover:text-purple-400',
  },
  blue: {
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400',
    glow: 'from-cyan-500/30 via-blue-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-cyan-500/60 shadow-cyan-950/20',
    btnBg: 'group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500',
    titleHover: 'group-hover:text-cyan-400',
  },
  amber: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
    glow: 'from-amber-500/30 via-orange-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-amber-500/60 shadow-amber-950/20',
    btnBg: 'group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500',
    titleHover: 'group-hover:text-amber-400',
  },
  rose: {
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
    glow: 'from-rose-500/30 via-pink-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-rose-500/60 shadow-rose-950/20',
    btnBg: 'group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500',
    titleHover: 'group-hover:text-rose-400',
  },
  teal: {
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    dot: 'bg-teal-400',
    glow: 'from-teal-500/30 via-emerald-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-teal-500/60 shadow-teal-950/20',
    btnBg: 'group-hover:bg-teal-500 group-hover:text-black group-hover:border-teal-500',
    titleHover: 'group-hover:text-teal-400',
  },
  cyan: {
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400',
    glow: 'from-cyan-500/30 via-blue-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-cyan-500/60 shadow-cyan-950/20',
    btnBg: 'group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500',
    titleHover: 'group-hover:text-cyan-400',
  },
  orange: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400',
    glow: 'from-orange-500/30 via-red-500/10 to-transparent',
    border: 'border-slate-800/90 hover:border-orange-500/60 shadow-orange-950/20',
    btnBg: 'group-hover:bg-orange-500 group-hover:text-black group-hover:border-orange-500',
    titleHover: 'group-hover:text-orange-400',
  }
};

const defaultCategories = [
  {
    _id: 'cat_protein_01',
    name: 'Protein',
    title: 'Whey & Isolate Protein',
    desc: 'Pure muscle synthesis & fast recovery',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80',
    colorTheme: 'emerald',
    order: 1
  },
  {
    _id: 'cat_mass_02',
    name: 'Mass Gainer',
    title: 'High Calorie Mass Gainers',
    desc: 'Calorie-dense bulking & solid mass',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80',
    colorTheme: 'purple',
    order: 2
  },
  {
    _id: 'cat_creatine_03',
    name: 'Creatine',
    title: 'Micronized Creatine',
    desc: 'ATP power, explosive strength & size',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80',
    colorTheme: 'blue',
    order: 3
  },
  {
    _id: 'cat_preworkout_04',
    name: 'Pre-Workout',
    title: 'Energy & Pump Formulas',
    desc: 'High-stim focus & maximum vasodilation',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    colorTheme: 'amber',
    order: 4
  },
  {
    _id: 'cat_bcaa_05',
    name: 'Supplements',
    title: 'BCAA & Amino Recovery',
    desc: 'Intra-workout hydration & endurance',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    colorTheme: 'rose',
    order: 5
  },
  {
    _id: 'cat_vitamins_06',
    name: 'Vitamins',
    title: 'Daily Multivitamins & Minerals',
    desc: 'Immunity, joints & performance health',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    colorTheme: 'teal',
    order: 6
  }
];

export default function CategorySection() {
  const { setSelectedCategory } = useProducts();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Instant cached initialization for zero layout shift
  const [categories, setCategories] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('og_homepage_categories') || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    } catch (e) {}
    return defaultCategories;
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await api.getCategories();
        if (res && res.categories && res.categories.length > 0 && isMounted) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.warn('[CategorySection Load Notice]', err.message);
      }
    };

    fetchCategories();

    // Socket.IO real-time instant synchronizers
    const handleCreated = (newCat) => {
      setCategories((prev) => {
        const next = [...prev.filter((c) => (c._id || c.id) !== (newCat._id || newCat.id)), newCat]
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        try { localStorage.setItem('og_homepage_categories', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    };

    const handleUpdated = (updatedCat) => {
      const targetId = updatedCat._id || updatedCat.id;
      setCategories((prev) => {
        const next = prev.map((c) => ((c._id || c.id) === targetId ? updatedCat : c))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        try { localStorage.setItem('og_homepage_categories', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    };

    const handleDeleted = ({ categoryId }) => {
      setCategories((prev) => {
        const next = prev.filter((c) => (c._id || c.id) !== categoryId);
        try { localStorage.setItem('og_homepage_categories', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    };

    socket.on('category:created', handleCreated);
    socket.on('category:updated', handleUpdated);
    socket.on('category:deleted', handleDeleted);

    return () => {
      isMounted = false;
      socket.off('category:created', handleCreated);
      socket.off('category:updated', handleUpdated);
      socket.off('category:deleted', handleDeleted);
    };
  }, []);

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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 animate-page-enter">
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
            className={`text-xs sm:text-sm font-bold flex items-center gap-1 transition-all active:scale-95 self-start sm:self-auto cursor-pointer ${
              isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Explore All Categories <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid with Responsive Layout */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${categories.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          {categories.map((cat, idx) => {
            const isEven = idx % 2 === 0;
            const slideAnim = isEven ? 'animate-slide-left' : 'animate-slide-right';
            const delayClass = `delay-${(idx % 4 + 1) * 100}`;
            const theme = themePresets[cat.colorTheme] || themePresets.emerald;

            return (
              <div
                key={cat._id || cat.id || cat.name || idx}
                onClick={() => handleCategoryClick(cat.name)}
                className={`group relative cursor-pointer rounded-[2rem] overflow-hidden border transition-all duration-500 flex flex-col justify-between ${
                  isDark
                    ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 text-slate-100 shadow-xl hover:shadow-2xl'
                    : 'bg-white text-slate-900 shadow-md hover:shadow-2xl'
                } ${theme.border} hover:-translate-y-2.5 hover:scale-[1.015] active:scale-95 ${slideAnim} ${delayClass}`}
              >
                {/* TOP: Large Dedicated Visual Showcase Stage */}
                <div className="relative w-full h-60 sm:h-64 overflow-hidden flex items-center justify-center p-5 bg-gradient-to-b from-slate-950/60 via-slate-900/20 to-transparent">
                  
                  {/* Ambient Glowing Color Aura behind Product */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.glow} opacity-30 group-hover:opacity-85 transition-opacity duration-500 blur-2xl pointer-events-none`} />

                  {/* Top Left: Category Badge Pill */}
                  <div className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${theme.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-pulse`} />
                    <span>{cat.badge || cat.name}</span>
                  </div>

                  {/* Top Right: Verified Importer / Quality Mini Tag */}
                  <div className="absolute top-4 right-4 z-20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-950/70 border border-slate-800 text-slate-400 backdrop-blur-md">
                    GENUINE
                  </div>

                  {/* Big Full Visible Image with Floating Elevation & Drop Shadow */}
                  <div className="relative w-full h-full flex items-center justify-center z-10 p-2">
                    <img
                      src={cat.image}
                      alt={cat.title || cat.name}
                      className="max-h-full max-w-full w-auto h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 ease-out"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Soft Glass Shine Line on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>

                {/* BOTTOM: Clean Typography & Interactive Action Button */}
                <div className="p-6 pt-3 flex flex-col justify-between flex-1 space-y-4 border-t border-slate-800/40">
                  <div className="space-y-1.5">
                    <h3 className={`text-xl font-black tracking-tight transition-colors duration-300 ${theme.titleHover}`}>
                      {cat.title}
                    </h3>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {cat.desc}
                    </p>
                  </div>

                  {/* Interactive Action Button */}
                  <div className="pt-2">
                    <div className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-black flex items-center justify-between transition-all duration-300 ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    } ${theme.btnBg}`}>
                      <span>Explore Collection</span>
                      <div className="w-6 h-6 rounded-xl bg-black/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
