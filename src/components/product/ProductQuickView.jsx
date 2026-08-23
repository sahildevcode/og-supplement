import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Star, ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import StockBadge from './StockBadge';

export default function ProductQuickView() {
  const { quickViewProduct, setQuickViewProduct } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedVariant(quickViewProduct.variants?.[0] || 'Standard');
      setSelectedFlavour(quickViewProduct.flavours?.[0] || 'Standard');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isOutOfStock = Number(quickViewProduct.stock) <= 0;
  const currentStock = Number(quickViewProduct.stock || 0);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(quickViewProduct, quantity, selectedVariant, selectedFlavour);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const added = addToCart(quickViewProduct, quantity, selectedVariant, selectedFlavour);
    if (added) {
      setQuickViewProduct(null);
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Product Image & Badges */}
          <div className="relative p-8 bg-gradient-to-b from-slate-800/50 to-slate-950 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
            {quickViewProduct.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-black shadow-lg">
                {quickViewProduct.discountPercentage}% OFF
              </span>
            )}
            <img
              src={quickViewProduct.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
              alt={quickViewProduct.name}
              className={`max-h-72 object-contain filter drop-shadow-2xl transition-transform hover:scale-105 duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Authentic</div>
              <div className="flex items-center gap-1"><Truck className="w-4 h-4 text-cyan-400" /> Express Dispatch</div>
            </div>
          </div>

          {/* Right: Product Details & Controls */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              
              {/* Brand & Stock Pill */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {quickViewProduct.brand}
                </span>
                <StockBadge stock={quickViewProduct.stock} lowStockThreshold={quickViewProduct.lowStockThreshold} />
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-white leading-tight">
                {quickViewProduct.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <span>{quickViewProduct.rating || 4.9}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-xs text-slate-400">({quickViewProduct.reviews || 840} verified reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-white">
                  ₹{quickViewProduct.discountPrice?.toLocaleString('en-IN') || quickViewProduct.price}
                </span>
                {quickViewProduct.price > (quickViewProduct.discountPrice || quickViewProduct.price) && (
                  <span className="text-sm text-slate-500 line-through">
                    ₹{quickViewProduct.price?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Variants / Weights */}
              {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Size / Weight:</label>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedVariant === v
                            ? 'bg-emerald-500 text-black border border-emerald-400 shadow-md shadow-emerald-950/50'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavours */}
              {quickViewProduct.flavours && quickViewProduct.flavours.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Flavour:</label>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.flavours.map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFlavour(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedFlavour === f
                            ? 'bg-emerald-500 text-black border border-emerald-400 shadow-md shadow-emerald-950/50'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700 font-black text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-white min-w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700 font-black text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">Max: {currentStock}</span>
                </div>
              )}

            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/40 hover:border-emerald-500'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black shadow-lg shadow-emerald-950/40'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Buy Now
                </button>
              </div>

              <Link
                to={`/products/${quickViewProduct._id || quickViewProduct.id}`}
                onClick={() => setQuickViewProduct(null)}
                className="block text-center text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors pt-1"
              >
                View Full Specifications & Nutrition Facts →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
