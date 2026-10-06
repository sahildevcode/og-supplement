import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from '../product/ProductCard';

export default function HomeBestSellers() {
  const { products, loading } = useProducts();
  const { isDark } = useTheme();

  // STRICT: Only products explicitly marked as Best Seller by admin in Admin Panel
  const displayList = products
    .filter((p) => p.isBestSeller === true)
    .sort((a, b) => (a.bestSellerRank || 999) - (b.bestSellerRank || 999) || (b.salesCount || 0) - (a.salesCount || 0));

  // If no products marked as best sellers, do not show the section
  if (!loading && displayList.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 sm:py-20 border-t transition-colors duration-300 relative overflow-hidden ${
      isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-gradient-to-b from-amber-500/5 to-white border-slate-200'
    }`}>
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-2">
              <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse" />
              <span>Official Leaderboard • Athlete's #1 Choice</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Best Selling <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Supplements</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              India's highest re-ordered proteins, gainers, and pre-workouts with 100% genuine importer hologram verification.
            </p>
          </div>

          <Link
            to="/best-sellers"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-950/40 transition-all hover:scale-105 self-start sm:self-auto flex-shrink-0"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid with Rank Badges */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-96 rounded-3xl animate-pulse border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              />
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Loading supplements...</div>
        ) : (
          <div className={
            displayList.length === 1
              ? 'max-w-xs mx-auto'
              : displayList.length === 2
              ? 'max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6'
              : displayList.length === 3
              ? 'max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
          }>
            {displayList.map((prod, idx) => {
              const rankNum = prod.bestSellerRank || idx + 1;
              const badgeText = prod.bestSellerBadge || (rankNum === 1 ? '🔥 #1 BEST SELLER' : `#${rankNum} TOP CHOICE`);

              return (
                <div key={prod._id || prod.id} className="relative flex flex-col group">
                  {/* Floating Best Seller Badge */}
                  <div className="absolute -top-3 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-black shadow-lg shadow-amber-950/50">
                    <Flame className="w-3 h-3 fill-black" />
                    <span>{badgeText}</span>
                  </div>

                  <div className="pt-2 h-full flex flex-col">
                    <ProductCard product={prod} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Live Sales Rank Updated in Real Time
              </h4>
              <p className="text-xs text-slate-400">
                Rankings automatically update based on confirmed customer purchases and admin recommendations.
              </p>
            </div>
          </div>

          <Link
            to="/best-sellers"
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black whitespace-nowrap transition-colors"
          >
            Explore Complete Best Sellers Page →
          </Link>
        </div>

      </div>
    </section>
  );
}
