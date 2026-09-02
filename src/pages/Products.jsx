import React from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, AlertCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/product/ProductCard';
import ProductQuickView from '../components/product/ProductQuickView';

export default function Products() {
  const {
    filteredProducts,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    sortOption,
    setSortOption,
    categories,
    brands,
  } = useProducts();

  const { isDark } = useTheme();

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSortOption('featured');
  };

  return (
    <div className={`min-h-screen py-10 sm:py-14 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-page-enter">
        
        {/* Page Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
              Verified Nutrition Catalog
            </span>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {selectedCategory === 'All' ? 'All Performance Supplements' : `${selectedCategory} Collection`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Showing {filteredProducts.length} premium laboratory-tested supplements
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search Whey, Creatine, ON..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-all duration-200 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-sm'
                }`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Options */}
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 transition-all ${
              isDark ? 'bg-slate-900 border-slate-700/80 hover:border-slate-600' : 'bg-white border-slate-300 shadow-sm hover:border-slate-400'
            }`}>
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className={`bg-transparent text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <option value="featured" className={isDark ? 'bg-slate-900' : 'bg-white'}>Featured</option>
                <option value="price_asc" className={isDark ? 'bg-slate-900' : 'bg-white'}>Price: Low to High</option>
                <option value="price_desc" className={isDark ? 'bg-slate-900' : 'bg-white'}>Price: High to Low</option>
                <option value="rating" className={isDark ? 'bg-slate-900' : 'bg-white'}>Top Rated</option>
                <option value="discount" className={isDark ? 'bg-slate-900' : 'bg-white'}>Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category & Brand Filter Pills with Slide Motion */}
        <div className="space-y-4">
          {/* Categories with Horizontal Slide Flow */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none animate-slide-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
              Category:
            </span>
            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-emerald-500 text-black border border-emerald-400 shadow-md shadow-emerald-950/40 scale-105'
                    : isDark
                    ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:scale-105 border border-slate-800'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:scale-105 border border-slate-200 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Brands with Horizontal Slide Flow */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none animate-slide-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
              Brand:
            </span>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                  selectedBrand.toLowerCase() === brand.toLowerCase()
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 scale-105'
                    : isDark
                    ? 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:scale-105 border border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:scale-105 border border-slate-200 shadow-sm'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCategory !== 'All' || selectedBrand !== 'All' || searchQuery) && (
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs animate-slide-left ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Filtered by: {selectedCategory !== 'All' && `[Category: ${selectedCategory}] `}
                {selectedBrand !== 'All' && `[Brand: ${selectedBrand}] `}
                {searchQuery && `[Search: "${searchQuery}"] `}
              </span>
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 font-bold text-rose-500 hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}

        {/* Product Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={`h-96 rounded-3xl animate-pulse border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto animate-page-enter">
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-sm'
            }`}>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No products found</h3>
            <p className="text-sm text-slate-400">
              No products found matching your search. Try another search or reset your active filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black active:scale-95 transition-all cursor-pointer"
            >
              Clear Filters & Show All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <div
                key={product._id || product.id}
                className={`animate-page-enter delay-${(idx % 4 + 1) * 100}`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>

      <ProductQuickView />
    </div>
  );
}
