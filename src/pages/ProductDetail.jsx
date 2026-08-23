import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import StockBadge from '../components/product/StockBadge';
import { api } from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Find from active live product context or fetch
  const liveProduct = products.find((p) => (p._id || p.id) === id);

  const [product, setProduct] = useState(liveProduct || null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (liveProduct) {
      setProduct(liveProduct);
      if (!selectedVariant && liveProduct.variants?.length) {
        setSelectedVariant(liveProduct.variants[0]);
      }
      if (!selectedFlavour && liveProduct.flavours?.length) {
        setSelectedFlavour(liveProduct.flavours[0]);
      }
    } else {
      // Fetch fallback
      api.getProductById(id)
        .then((res) => {
          if (res.product) {
            setProduct(res.product);
            setSelectedVariant(res.product.variants?.[0] || 'Standard');
            setSelectedFlavour(res.product.flavours?.[0] || 'Standard');
          }
        })
        .catch(console.error);
    }
  }, [id, liveProduct, selectedVariant, selectedFlavour]);

  if (!product) {
    return (
      <div className={`min-h-[70vh] flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading supplement details...</p>
        </div>
      </div>
    );
  }

  const isOutOfStock = Number(product.stock) <= 0;
  const currentStock = Number(product.stock || 0);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant, selectedFlavour);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, quantity, selectedVariant, selectedFlavour);
    if (added) {
      navigate('/checkout');
    }
  };

  return (
    <div className={`min-h-screen py-10 sm:py-14 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-emerald-500 transition-colors">Supplements</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-500 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className={`relative aspect-square w-full rounded-3xl p-8 flex items-center justify-center overflow-hidden border shadow-lg ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}>
              {product.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-black shadow-lg">
                  {product.discountPercentage}% OFF
                </div>
              )}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md border transition-all ${
                  isWishlisted
                    ? 'bg-rose-500 text-white border-rose-400'
                    : isDark ? 'bg-slate-900/80 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <img
                src={product.images?.[activeImage] || product.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'}
                alt={product.name}
                className={`max-h-96 object-contain filter drop-shadow-2xl transition-transform duration-300 hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
              />
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-2xl p-2 border transition-all ${
                      activeImage === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
                        : isDark ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-white border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              
              {/* Brand & Live Stock Badge */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
                  {product.brand}
                </span>
                <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
              </div>

              {/* Product Title */}
              <h1 className={`text-2xl sm:text-4xl font-black tracking-tight leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-black">
                  <span>{product.rating || 4.9}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-xs text-slate-400">({product.reviews || 890} verified buyers)</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Authentic
                </span>
              </div>

              {/* Price Details */}
              <div className="pt-2 flex items-baseline gap-3">
                <span className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{product.discountPrice?.toLocaleString('en-IN') || product.price}
                </span>
                {product.price > (product.discountPrice || product.price) && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Inclusive of GST and all applicable taxes</p>

            </div>

            {/* Variant / Size Picker */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Size / Package:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedVariant === v
                          ? 'bg-emerald-500 text-black border border-emerald-400 shadow-md shadow-emerald-950/40'
                          : isDark ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavour Picker */}
            {product.flavours && product.flavours.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Flavor:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.flavours.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFlavour(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedFlavour === f
                          ? 'bg-emerald-500 text-black border border-emerald-400 shadow-md shadow-emerald-950/40'
                          : isDark ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quantity:</span>
                <div className={`flex items-center border rounded-xl overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
                }`}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-slate-400 hover:text-emerald-500 font-bold"
                  >
                    -
                  </button>
                  <span className={`px-4 py-2 text-sm font-bold min-w-10 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3.5 py-2 text-slate-400 hover:text-emerald-500 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">Available: {currentStock} units</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-4 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 shadow-sm'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-4 px-6 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black shadow-xl shadow-emerald-950/40 active:scale-98'
                }`}
              >
                <Zap className="w-5 h-5 fill-black" />
                Buy Now
              </button>
            </div>

            {/* Delivery & Trust Pledges */}
            <div className={`grid grid-cols-3 gap-3 p-4 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="space-y-1">
                <Truck className="w-5 h-5 text-cyan-500 mx-auto" />
                <p className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Express Delivery</p>
                <p className="text-[10px] text-slate-400">24-48h dispatch</p>
              </div>
              <div className={`space-y-1 border-x px-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto" />
                <p className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>100% Authentic</p>
                <p className="text-[10px] text-slate-400">Direct from brand</p>
              </div>
              <div className="space-y-1">
                <RotateCcw className="w-5 h-5 text-rose-500 mx-auto" />
                <p className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Easy Returns</p>
                <p className="text-[10px] text-slate-400">7-Day Guarantee</p>
              </div>
            </div>

          </div>

        </div>

        {/* Tabbed Detailed Specifications */}
        <div className={`pt-10 border-t space-y-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-4 border-b overflow-x-auto pb-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {['description', 'ingredients', 'nutrition', 'usage'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-emerald-500 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'nutrition' ? 'Nutritional Facts' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className={`border rounded-3xl p-6 sm:p-8 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {activeTab === 'description' && (
              <div className="space-y-4 text-sm leading-relaxed">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Product Overview</h3>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{product.description}</p>
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className="font-bold text-emerald-500">Category:</span> {product.category}
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className="font-bold text-emerald-500">Brand:</span> {product.brand}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4 text-sm leading-relaxed">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Clean & Lab-Tested Ingredients</h3>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{product.ingredients || 'Pure Active Matrix, Natural & Artificial Flavors, Emulsifier, Sweetener.'}</p>
                <p className="text-xs text-slate-400 italic">No banned substances, no unlisted fillers, 100% compliant with FSSAI regulations.</p>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="space-y-4 text-sm leading-relaxed">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nutritional Facts (Per Serving)</h3>
                {product.nutritionalInfo && Object.keys(product.nutritionalInfo).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(product.nutritionalInfo).map(([k, v]) => (
                      <div key={k} className={`p-4 rounded-2xl border text-center ${
                        isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{k}</p>
                        <p className="text-xl font-black text-emerald-500 mt-1">{v}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Standard High-Potency Sports Nutrition Profile.</p>
                )}
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-4 text-sm leading-relaxed">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recommended Usage & Directions</h3>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  Mix 1 scoop with 200-250ml of cold water, skimmed milk, or your favorite beverage in a shaker. Shake vigorously for 25-30 seconds until fully dissolved.
                </p>
                <p className="text-xs text-slate-400">
                  Best consumed immediately post-workout or first thing in the morning.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
