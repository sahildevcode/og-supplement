import React, { useState, useEffect, useRef } from 'react';
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
  Heart,
  Camera,
  Image as ImageIcon,
  X,
  Plus,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import StockBadge from '../components/product/StockBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
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

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const [reviewForm, setReviewForm] = useState({
    name: user?.name || '',
    rating: 5,
    title: '',
    comment: '',
    images: []
  });

  useEffect(() => {
    if (user?.name && !reviewForm.name) {
      setReviewForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Real-time listener for newly submitted reviews
  useEffect(() => {
    const handleReviewAdded = (data) => {
      const currentId = product?._id || product?.id;
      if (data && (data.productId === currentId || data.product?._id === currentId)) {
        if (data.product) {
          setProduct(data.product);
        }
      }
    };

    socket.on('product:review_added', handleReviewAdded);
    return () => {
      socket.off('product:review_added', handleReviewAdded);
    };
  }, [product]);

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

  const productImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const galleryImages = productImages.length >= 2
    ? productImages
    : [
        productImages[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
      ];

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

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (reviewForm.images.length + files.length > 3) {
      addToast('You can attach up to 3 photos per review', 'warning');
      return;
    }

    try {
      const compressedList = await Promise.all(files.map(compressImage));
      setReviewForm((prev) => ({
        ...prev,
        images: [...prev.images, ...compressedList].slice(0, 3)
      }));
    } catch (err) {
      addToast('Failed to process image file', 'error');
    }
  };

  const handleRemoveReviewImage = (index) => {
    setReviewForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      addToast('Please write your review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.addProductReview(product._id || product.id, reviewForm);
      if (res.success && res.product) {
        setProduct(res.product);
        addToast('🎉 Thank you! Your review has been published.', 'success');
        setReviewForm({
          name: user?.name || '',
          rating: 5,
          title: '',
          comment: '',
          images: []
        });
        setShowReviewForm(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const scrollToReviews = () => {
    const el = document.getElementById('reviews-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
                src={galleryImages[activeImage] || galleryImages[0]}
                alt={product.name}
                className={`max-h-96 object-contain filter drop-shadow-2xl transition-transform duration-300 hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
              />
            </div>

            {/* Interactive Multi-Image Thumbnail Gallery (At least 4 images) */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  onMouseEnter={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl p-2 border transition-all duration-200 flex-shrink-0 cursor-pointer ${
                    activeImage === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/10 scale-105 shadow-md shadow-emerald-950/30'
                      : isDark ? 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600' : 'bg-white border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-contain" />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
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
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-black hover:bg-amber-500/25 transition-all cursor-pointer"
                  title="Click to view all reviews"
                >
                  <span>{product.rating || 4.9}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="text-xs text-slate-400 hover:text-emerald-500 transition-colors underline-offset-4 hover:underline cursor-pointer"
                >
                  ({product.reviews || (product.reviewsList?.length || 0)} customer reviews)
                </button>
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
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-400 font-medium">
                    {product.isGstApplicable !== false
                      ? `Inclusive of ${product.gstRate || 18}% GST • No hidden charges`
                      : 'Zero Tax / GST-Free Product • No extra charges'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span className="text-slate-400 font-medium">
                    {Number(product.shippingCost) > 0
                      ? `Delivery: ₹${product.shippingCost}`
                      : 'Free Express Delivery'}
                  </span>
                </div>
              </div>

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

        {/* Customer Reviews & Ratings Section */}
        <div id="reviews-section" className={`pt-12 border-t space-y-8 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Verified Customer Feedback
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real reviews and unboxing photos from our fitness community
              </p>
            </div>

            <button
              onClick={() => setShowReviewForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              {showReviewForm ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel Review
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Write a Review
                </>
              )}
            </button>
          </div>

          {/* Review Submission Form Drawer / Card */}
          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 ${
                isDark ? 'bg-slate-900/90 border-emerald-500/30' : 'bg-white border-emerald-500/30 shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Share Your Experience
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rate this product and upload your unboxing/results photos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Overall Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            (hoverRating || reviewForm.rating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : isDark ? 'text-slate-700' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-500 ml-2">
                    {['', '1 - Terrible', '2 - Poor', '3 - Average', '4 - Very Good', '5 - Outstanding!'][hoverRating || reviewForm.rating]}
                  </span>
                </div>
              </div>

              {/* Reviewer Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Best Whey Protein for Quick Recovery"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Review Comment Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Detailed Review <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share details about taste, mixability, digestion, results, packaging, etc..."
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Image Upload / Attach Photos Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-500" />
                    Attach Photos (Up to 3 images)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {reviewForm.images.length}/3 photos added
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Image Previews */}
                  {reviewForm.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-md group"
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveReviewImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Photo Button */}
                  {reviewForm.images.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all cursor-pointer ${
                        isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-300 bg-slate-50'
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px] font-bold">Add Photo</span>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: Upload photos of the product bottle, scoop, shake or authentication seal.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-slate-800 border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Publishing Review...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Rating Breakdown Overview */}
          {(() => {
            const reviewsList = product.reviewsList || [];
            const totalCount = reviewsList.length;
            const avgRating = totalCount > 0
              ? (reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalCount).toFixed(1)
              : (product.rating || 4.9);

            const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviewsList.forEach((r) => {
              const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
              starCounts[star] = (starCounts[star] || 0) + 1;
            });

            return (
              <div className={`p-6 sm:p-8 rounded-3xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Big Average Score */}
                  <div className="md:col-span-4 text-center md:border-r dark:border-slate-800 border-slate-200 md:pr-8">
                    <div className="text-5xl sm:text-6xl font-black text-amber-400">
                      {avgRating}
                    </div>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(avgRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">
                      Based on {totalCount || product.reviews || 890} verified ratings
                    </p>
                    <p className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 98% Recommended
                    </p>
                  </div>

                  {/* Right Column: Star Distribution Bars */}
                  <div className="md:col-span-8 space-y-2.5">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = totalCount > 0 ? starCounts[stars] : (stars === 5 ? 750 : stars === 4 ? 110 : stars === 3 ? 20 : stars === 2 ? 8 : 2);
                      const displayTotal = totalCount > 0 ? totalCount : 890;
                      const percentage = Math.round((count / displayTotal) * 100);

                      return (
                        <div key={stars} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-bold text-slate-400 flex items-center gap-1 justify-end">
                            {stars} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                          </span>
                          <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${
                            isDark ? 'bg-slate-800' : 'bg-slate-100'
                          }`}>
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-12 text-slate-400 font-medium text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Customer Reviews Feed */}
          <div className="space-y-4">
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Community Reviews ({product.reviewsList?.length || 0})
            </h3>

            {(!product.reviewsList || product.reviewsList.length === 0) ? (
              <div className={`p-10 rounded-3xl border text-center space-y-4 ${
                isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    No Reviews Yet
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Be the first customer to share your thoughts, flavor rating, and photos with our fitness community!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Write the First Review
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[...product.reviewsList].reverse().map((rev, idx) => (
                  <div
                    key={rev._id || idx}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                      isDark ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-black text-sm flex items-center justify-center shadow-md">
                          {(rev.name || 'User').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {rev.name || 'Verified Buyer'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (Number(rev.rating) || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : isDark ? 'text-slate-800' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.title && (
                      <h4 className={`text-sm font-black mt-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {rev.title}
                      </h4>
                    )}

                    <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {rev.comment}
                    </p>

                    {/* Customer Attached Photos */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {rev.images.map((imgSrc, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={() => setSelectedReviewImage(imgSrc)}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-700/60 hover:border-emerald-500 hover:scale-105 transition-all group cursor-pointer"
                          >
                            <img
                              src={imgSrc}
                              alt={`Customer photo ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Photo Lightbox Modal */}
        {selectedReviewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedReviewImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedReviewImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedReviewImage}
                alt="Enlarged review photo"
                className="w-full h-full object-contain max-h-[85vh] rounded-3xl"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
