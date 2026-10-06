import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Flame,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Plus,
  X,
  Filter,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Camera,
  Heart
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const GOAL_OPTIONS = [
  'All',
  'Muscle Building',
  'Fat Loss & Shred',
  'Strength & Power',
  'Daily Fitness & Stamina'
];

export default function ReviewsResults() {
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likedMap, setLikedMap] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    city: '',
    rating: 5,
    transformationGoal: 'Muscle Building',
    duration: '12 Weeks',
    productUsed: '',
    title: '',
    comment: '',
    beforeImage: '',
    afterImage: ''
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getReviews();
      if (data && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.warn('[Fetch Reviews Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    const handleCreated = (newRev) => {
      setReviews((prev) => [newRev, ...prev.filter((r) => (r._id || r.id) !== (newRev._id || newRev.id))]);
    };

    const handleLiked = ({ id, likes }) => {
      setReviews((prev) => prev.map((r) => ((r._id || r.id) === id ? { ...r, likes } : r)));
    };

    socket.on('review:created', handleCreated);
    socket.on('review:liked', handleLiked);

    return () => {
      socket.off('review:created', handleCreated);
      socket.off('review:liked', handleLiked);
    };
  }, []);

  const handleLike = async (id) => {
    if (likedMap[id]) return;
    setLikedMap((prev) => ({ ...prev, [id]: true }));
    try {
      await api.likeReview(id);
      setReviews((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, likes: (r.likes || 0) + 1 } : r))
      );
    } catch (e) {
      console.warn('Like error', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.comment || !formData.productUsed) {
      addToast('Please fill out your Name, Product Used, and Review Story', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitReview(formData);
      if (res && res.success) {
        addToast('Thank you! Your transformation story is now live.', 'success');
        setIsModalOpen(false);
        setFormData({
          customerName: '',
          city: '',
          rating: 5,
          transformationGoal: 'Muscle Building',
          duration: '12 Weeks',
          productUsed: '',
          title: '',
          comment: '',
          beforeImage: '',
          afterImage: ''
        });
        fetchReviews();
      }
    } catch (err) {
      addToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedGoal !== 'All' && r.transformationGoal.toLowerCase() !== selectedGoal.toLowerCase()) {
      return false;
    }
    if (selectedRating !== 'All' && Number(r.rating) !== Number(selectedRating)) {
      return false;
    }
    return true;
  });

  const transformationCards = reviews.filter((r) => r.beforeImage && r.afterImage);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pb-20 border-b border-slate-800/60 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-6 shadow-lg shadow-emerald-950/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Verified Customer Stories & Results</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto">
            Real People. Real Results.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Proven Transformations.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            See unfiltered photos, muscle gains, weight loss journeys, and honest reviews from athletes across India fueling their progress with OG-Supplement.
          </p>

          {/* Social Proof Trust Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="block text-xl font-black text-white">4.9 / 5.0</span>
              <span className="text-[11px] font-semibold text-slate-400">Average Store Rating</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="block text-xl font-black text-emerald-400">10,000+</span>
              <span className="text-[11px] font-semibold text-slate-400">Happy Athletes</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="block text-xl font-black text-cyan-400">100% Genuine</span>
              <span className="text-[11px] font-semibold text-slate-400">Lab Tested Guaranteed</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="block text-xl font-black text-rose-400">98.4%</span>
              <span className="text-[11px] font-semibold text-slate-400">Recommend to Friends</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black shadow-xl shadow-emerald-950/50 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Your Review & Transformation</span>
            </button>

            <Link
              to="/best-sellers"
              className="px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 transition-colors flex items-center gap-2"
            >
              <span>Explore Best Sellers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 1: VISUAL BEFORE & AFTER TRANSFORMATION SHOWCASE */}
      {transformationCards.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-400">
                <Flame className="w-4 h-4 fill-emerald-400" />
                <span>Real Results Gallery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Before & After Transformations
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Real customers who combined discipline, consistent workouts, and authentic OG-Supplement nutrition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformationCards.map((rev) => (
              <div
                key={rev._id || rev.id}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:border-emerald-500/50 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Before / After Images Side by Side */}
                <div className="relative grid grid-cols-2 gap-1 p-2 bg-slate-950">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900">
                    <img
                      src={rev.beforeImage}
                      alt="Before Transformation"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black/80 text-slate-300">
                      Before
                    </span>
                  </div>

                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900">
                    <img
                      src={rev.afterImage}
                      alt="After Transformation"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-black">
                      After ({rev.duration || '12 Wks'})
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{rev.customerName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified Buyer" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold">{rev.city}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400">
                        {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {rev.transformationGoal}
                      </span>
                    </div>

                    {rev.title && (
                      <h4 className="font-bold text-white text-sm mt-2 line-clamp-1">{rev.title}</h4>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed mt-1 line-clamp-3">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Supplement Used Card */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-semibold">Supplement Stack:</span>
                      <span className="font-bold text-amber-400 truncate block text-xs">{rev.productUsed}</span>
                    </div>

                    <button
                      onClick={() => handleLike(rev._id || rev.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        likedMap[rev._id || rev.id]
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedMap[rev._id || rev.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{rev.likes || 0}</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: VERIFIED CUSTOMER REVIEWS FEED */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filters & Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-800/60">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              All Verified Buyer Reviews ({filteredReviews.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter by fitness objective or star rating
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGoal(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGoal === g
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40'
                    : isDark
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="pt-8 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading verified customer reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16 space-y-3 rounded-3xl bg-slate-900/40 border border-slate-800">
              <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No reviews found for this filter</h4>
              <p className="text-xs text-slate-400">Be the first to share your experience with this category!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev._id || rev.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isDark ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Review Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rev.customerName}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Verified Purchase
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {rev.city || 'India'}
                        </span>
                        <span>•</span>
                        <span>{new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Product Tag */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-950 border border-slate-800 text-amber-400">
                      📦 {rev.productUsed}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                      🎯 {rev.transformationGoal}
                    </span>
                  </div>

                  {/* Title & Comment */}
                  {rev.title && (
                    <h4 className="font-bold text-white text-sm mt-3">{rev.title}</h4>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    "{rev.comment}"
                  </p>

                  {/* Footer / Likes */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px]">Was this review helpful?</span>
                    <button
                      onClick={() => handleLike(rev._id || rev.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        likedMap[rev._id || rev.id]
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({rev.likes || 0})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* WRITE A REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-slate-100 shadow-2xl">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Share Your Fitness Journey
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Submit Your Review & Results
              </h2>
              <p className="text-xs text-slate-400">
                Help other athletes choose the right supplement by sharing your honest feedback and transformation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-300">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block font-bold mb-1 text-slate-300">Star Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 cursor-pointer transition-colors ${
                          star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">{formData.rating} out of 5 Stars</span>
                </div>
              </div>

              {/* Product & Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Supplement Used *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NitroTech Whey Gold"
                    value={formData.productUsed}
                    onChange={(e) => setFormData({ ...formData, productUsed: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-300">Fitness Objective</label>
                  <select
                    value={formData.transformationGoal}
                    onChange={(e) => setFormData({ ...formData, transformationGoal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Fat Loss & Shred">Fat Loss & Shred</option>
                    <option value="Strength & Power">Strength & Power</option>
                    <option value="Daily Fitness & Stamina">Daily Fitness & Stamina</option>
                    <option value="General Wellness">General Wellness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Gained 5kg lean mass with zero bloating!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Your Detailed Review & Story *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details on taste, mixability, recovery, strength gains, and your daily routine..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Optional Transformation Image URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Before Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://...before.jpg"
                    value={formData.beforeImage}
                    onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-300">After Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://...after.jpg"
                    value={formData.afterImage}
                    onChange={(e) => setFormData({ ...formData, afterImage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 text-black shadow-lg shadow-emerald-950/50"
                >
                  {submitting ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
