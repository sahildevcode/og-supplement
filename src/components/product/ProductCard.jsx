import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Heart, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import StockBadge from './StockBadge';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { setQuickViewProduct } = useProducts();
  const { isDark } = useTheme();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedAnim, setIsAddedAnim] = useState(false);

  const isOutOfStock = Number(product.stock) <= 0;
  const productId = product._id || product.id;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const added = addToCart(product, 1);
    if (added) {
      setIsAddedAnim(true);
      setTimeout(() => setIsAddedAnim(false), 1200);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <div className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 product-card-hover shine-hover flex flex-col justify-between ${
      isDark
        ? 'bg-slate-900/80 backdrop-blur-md border-slate-800/80 hover:border-emerald-500/50 shadow-xl'
        : 'bg-white border-slate-200/80 hover:border-emerald-500/50 shadow-md hover:shadow-xl'
    }`}>
      
      {/* Top Image Container */}
      <div className={`relative aspect-square w-full overflow-hidden flex items-center justify-center p-6 transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-slate-800/40 to-slate-900/80'
          : 'bg-gradient-to-b from-slate-50 to-slate-100/70'
      }`}>
        
        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3.5 left-3.5 z-10 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md">
            {product.discountPercentage}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className={`absolute top-3.5 right-3.5 z-10 p-2 rounded-full backdrop-blur-md border transition-all ${
            isWishlisted
              ? 'bg-rose-500 text-white border-rose-400 scale-110'
              : isDark
              ? 'bg-slate-900/70 text-slate-400 hover:text-white border-slate-700/60 hover:bg-slate-800'
              : 'bg-white/80 text-slate-400 hover:text-rose-500 border-slate-200 hover:bg-white shadow-sm'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image with Hover Zoom */}
        <Link to={`/products/${productId}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className={`w-full h-full object-contain filter drop-shadow-xl transition-all duration-500 group-hover:scale-110 ${
              isOutOfStock ? 'opacity-40 grayscale' : 'group-hover:brightness-105'
            }`}
            loading="lazy"
          />
        </Link>

        {/* Quick View Button (Smooth slide-up on hover) */}
        <button
          onClick={handleQuickView}
          className={`absolute bottom-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xl whitespace-nowrap z-10 ${
            isDark
              ? 'bg-slate-900/90 text-slate-200 hover:text-white border border-slate-700'
              : 'bg-white/95 text-slate-800 hover:text-emerald-600 border border-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-500" />
          Quick View
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          
          {/* Brand & Stock Status Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
              {product.brand}
            </span>
            <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} showCount={false} />
          </div>

          {/* Product Name */}
          <Link to={`/products/${productId}`} className="block">
            <h3 className={`text-sm sm:text-base font-bold transition-colors line-clamp-2 leading-snug ${
              isDark ? 'text-slate-100 group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-600'
            }`}>
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold">
              <span>{product.rating || 4.8}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs text-slate-400">
              ({product.reviews || 120})
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-400 truncate">{product.category}</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Section */}
        <div className={`pt-3 border-t flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ₹{product.discountPrice ? product.discountPrice.toLocaleString('en-IN') : product.price}
              </span>
              {product.price > (product.discountPrice || product.price) && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Inclusive of GST</p>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              isOutOfStock
                ? isDark
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : isAddedAnim
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                : isDark
                ? 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-black border border-emerald-300 hover:border-emerald-500 shadow-sm'
            }`}
          >
            {isAddedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
