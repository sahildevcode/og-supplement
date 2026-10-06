import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  TrendingUp,
  Star,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter,
  CheckCircle2,
  Package,
  Award,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/product/ProductCard';

export default function BestSellers() {
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const { setQuickViewProduct } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rank'); // 'rank' | 'sales' | 'rating' | 'price_low' | 'price_high'
  const [addedId, setAddedId] = useState(null);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const data = await api.getBestSellers();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('[Best Sellers Fetch Warning]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestSellers();

    const handleProductUpdated = (updated) => {
      const pid = updated._id || updated.id;
      setProducts((prev) => {
        // If product was updated and is best seller, update it
        if (updated.isBestSeller) {
          const exists = prev.some((p) => (p._id || p.id) === pid);
          if (exists) {
            return prev.map((p) => ((p._id || p.id) === pid ? { ...p, ...updated } : p));
          } else {
            return [...prev, updated];
          }
        } else {
          // If product is no longer best seller, remove from list
          return prev.filter((p) => (p._id || p.id) !== pid);
        }
      });
    };

    const handleBestSellerUpdated = (updated) => {
      handleProductUpdated(updated);
    };

    socket.on('product:updated', handleProductUpdated);
    socket.on('product:bestSellerUpdated', handleBestSellerUpdated);

    return () => {
      socket.off('product:updated', handleProductUpdated);
      socket.off('product:bestSellerUpdated', handleBestSellerUpdated);
    };
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rank') {
      return (a.bestSellerRank || 999) - (b.bestSellerRank || 999) || (b.salesCount || 0) - (a.salesCount || 0);
    }
    if (sortBy === 'sales') {
      return (b.salesCount || 0) - (a.salesCount || 0);
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'price_low') {
      return (a.discountPrice || a.price) - (b.discountPrice || b.price);
    }
    if (sortBy === 'price_high') {
      return (b.discountPrice || b.price) - (a.discountPrice || a.price);
    }
    return 0;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pb-20 border-b border-slate-800/60 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-6 shadow-lg shadow-amber-950/40">
            <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
            <span>India's Most In-Demand Supplements</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto">
            Official <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Best Sellers</span> Showcase
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            These are the top formulas chosen by thousands of Indian bodybuilders, powerlifters, and athletes. 100% genuine, lab-verified, and backed by proven transformation results.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="block text-xl font-black text-amber-400">#1 Choice</span>
              <span className="text-[11px] font-semibold text-slate-400">Gym Athletes</span>
            </div>
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="block text-xl font-black text-emerald-400">100% Authentic</span>
              <span className="text-[11px] font-semibold text-slate-400">Importer Hologram</span>
            </div>
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="block text-xl font-black text-cyan-400">4.9 ★ Rating</span>
              <span className="text-[11px] font-semibold text-slate-400">Verified Buyers</span>
            </div>
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="block text-xl font-black text-rose-400">Fast Express</span>
              <span className="text-[11px] font-semibold text-slate-400">Same-Day Dispatch</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Listing Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Bar: Category Filter & Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-800/60">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/40 scale-105'
                    : isDark
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-amber-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-amber-500'
              }`}
            >
              <option value="rank">⭐ Best Seller Rank</option>
              <option value="sales">🔥 Most Sold Units</option>
              <option value="rating">★ Highest Customer Rating</option>
              <option value="price_low">₹ Price: Low to High</option>
              <option value="price_high">₹ Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Product Cards Grid */}
        <div className="pt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-96 rounded-3xl animate-pulse border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Package className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No best sellers found in this category</h3>
              <p className="text-xs text-slate-400">Try selecting "All" or browse our complete supplements catalog.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 text-black hover:bg-amber-400 transition-colors"
              >
                <span>Explore Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod, idx) => {
                const rankNum = prod.bestSellerRank || idx + 1;
                const badgeText = prod.bestSellerBadge || (rankNum === 1 ? '🔥 #1 BEST SELLER' : `#${rankNum} TOP CHOICE`);

                return (
                  <div key={prod._id || prod.id} className="relative flex flex-col">
                    
                    {/* Floating Rank Badge over Card */}
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
        </div>

        {/* Bottom Banner: Link to Customer Reviews & Results */}
        <div className={`mt-20 p-8 sm:p-10 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border-slate-800'
            : 'bg-gradient-to-r from-slate-50 via-white to-amber-50 border-slate-200'
        }`}>
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" />
              Proven Customer Transformations
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              See Real Results from These Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Check out before & after transformations, muscle gains, and verified reviews from real customers who used these exact formulas.
            </p>
          </div>

          <Link
            to="/reviews"
            className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-black shadow-xl shadow-amber-950/50 flex items-center gap-2 flex-shrink-0 transition-transform active:scale-95"
          >
            <span>View Happy Customers & Results</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

    </div>
  );
}
