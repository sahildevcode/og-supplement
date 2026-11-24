import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { socket } from '../../services/socket';

const DEFAULT_PREVIEWS = [
  {
    _id: 'default-1',
    customerName: 'Aman Deep Sharma',
    city: 'Delhi NCR',
    gainMetric: '+5.8 KG Lean Muscle',
    productUsed: 'NitroTech Whey Gold',
    duration: '16 Weeks',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
    comment: 'Mixability is super smooth, no bloating. Bench increased to 95kg with 100% genuine supplements.'
  },
  {
    _id: 'default-2',
    customerName: 'Rohit Kulkarni',
    city: 'Pune',
    gainMetric: '-7.4 KG Fat Loss',
    productUsed: 'ON 100% Whey Isolate',
    duration: '12 Weeks',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
    comment: 'Importer hologram code verified instantly. Recovery after 5 AM fasted cardio is unbelievable.'
  },
  {
    _id: 'default-3',
    customerName: 'Priya Rathore',
    city: 'Jaipur',
    gainMetric: '+15 KG Deadlift PR',
    productUsed: 'Creatine Monohydrate',
    duration: '8 Weeks',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80',
    comment: 'Zero bloat, instant stamina spike on leg days without stomach cramps. Fast delivery!'
  }
];

// Fallback images if uploaded image link fails or is unavailable on cold restart
const FALLBACK_BEFORE = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80';
const FALLBACK_AFTER = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80';

// Helper to resolve image URL if it's relative
const resolveImg = (src, fallback = FALLBACK_AFTER) => {
  if (!src) return fallback;
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  return `https://og-supplement-server.onrender.com${src.startsWith('/') ? '' : '/'}${src}`;
};

export default function HomeTransformations() {
  const { isDark } = useTheme();
  const [transformations, setTransformations] = useState(DEFAULT_PREVIEWS);

  const loadTransformations = async () => {
    try {
      const res = await api.getReviews();
      if (res && res.reviews && Array.isArray(res.reviews)) {
        // Show all reviews that have either beforeImage, afterImage, or are featured
        const withPhotos = res.reviews.filter(r => r.beforeImage || r.afterImage);
        if (withPhotos.length > 0) {
          setTransformations(withPhotos.slice(0, 6));
        } else {
          setTransformations(DEFAULT_PREVIEWS);
        }
      }
    } catch (e) {
      // Keep defaults gracefully
    }
  };

  useEffect(() => {
    loadTransformations();

    const handleUpdate = () => loadTransformations();
    socket.on('review:created', handleUpdate);
    socket.on('review:updated', handleUpdate);
    socket.on('review:deleted', handleUpdate);

    return () => {
      socket.off('review:created', handleUpdate);
      socket.off('review:updated', handleUpdate);
      socket.off('review:deleted', handleUpdate);
    };
  }, []);

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

        {/* Dynamic Transformation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {transformations.map((t, idx) => {
            const name = t.customerName || t.name;
            const beforeImg = t.beforeImage || t.before;
            const afterImg = t.afterImage || t.after;
            const quoteText = t.comment || t.quote;
            const prod = t.productUsed || t.product;
            const gain = t.gainMetric || t.gain || (t.transformationGoal ? `${t.transformationGoal}` : '+Lean Gains');
            const dur = t.duration || '12 Weeks';
            const stars = Number(t.rating) || 5;

            return (
              <div
                key={t._id || t.id || idx}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:border-emerald-500/40 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Single Image OR Side-by-Side Before/After */}
                {t.beforeImage && t.afterImage ? (
                  /* Two Images: Split View */
                  <div className="grid grid-cols-2 gap-1 p-2 bg-slate-950">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900">
                      <img 
                        src={resolveImg(beforeImg, FALLBACK_BEFORE)} 
                        alt="Before" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_BEFORE;
                        }} 
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-black/80 text-slate-300">
                        Before
                      </span>
                    </div>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900">
                      <img 
                        src={resolveImg(afterImg, FALLBACK_AFTER)} 
                        alt="After" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_AFTER;
                        }} 
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-black">
                        {dur}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Single Image: Full Width View (Landscape or Portrait auto-fits) */
                  <div className="p-2 bg-slate-950">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                      <img
                        src={resolveImg(beforeImg || afterImg, FALLBACK_AFTER)}
                        alt="Transformation Result"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_AFTER;
                        }}
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-black shadow-md">
                        {dur}
                      </span>
                      {gain && (
                        <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-black shadow-md">
                          {gain}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border shrink-0 ${
                        isDark 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {gain}
                      </span>
                    </div>

                    <div className="flex text-amber-400 my-1">
                      {[...Array(Math.min(5, Math.max(1, stars)))].map((_, s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>

                    <p className={`text-xs leading-relaxed line-clamp-3 font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      "{quoteText}"
                    </p>
                  </div>

                  <div className={`pt-2 border-t text-[11px] flex items-center justify-between ${
                    isDark ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}>
                    <div className="truncate">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Used:</span>{' '}
                      <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{prod}</span>
                    </div>
                    {t.city && (
                      <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.city}</span>
                    )}
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
