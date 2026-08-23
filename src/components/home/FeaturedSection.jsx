import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from '../product/ProductCard';

export default function FeaturedSection() {
  const { products, loading } = useProducts();
  const { isDark } = useTheme();

  // Show top 4-8 products
  const featured = products.slice(0, 8);

  return (
    <section className={`py-16 sm:py-20 transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 scroll-reveal reveal-active">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-500">
              <Flame className="w-4 h-4 fill-emerald-500" />
              <span>Trending & Best Sellers</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Popular Supplements
            </h2>
          </div>
          <Link
            to="/products"
            className={`text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors self-start sm:self-auto ${
              isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            View Full Store Catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid with Fade-in and Hover */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`h-96 rounded-3xl animate-pulse border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((prod, idx) => (
              <div key={prod._id || prod.id} className={`scroll-reveal reveal-active delay-${(idx % 4 + 1) * 100}`}>
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
