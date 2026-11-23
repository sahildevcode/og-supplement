import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Upload,
  CheckCircle2,
  Star,
  Flame,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Heart,
  Eye,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAdminToast } from '../context/AdminToastContext';
import ModalPortal from '../components/ModalPortal';

const GOAL_OPTIONS = [
  'Muscle Building',
  'Fat Loss & Shred',
  'Strength & Power',
  'Daily Fitness & Stamina',
  'General Wellness'
];

// Helper to resolve image URL if it's relative
const resolveImg = (src) => {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  return `https://og-supplement-server.onrender.com${src.startsWith('/') ? '' : '/'}${src}`;
};

export default function AdminTransformations() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'transformations', 'reviews'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingField, setUploadingField] = useState(null);

  const { addToast } = useAdminToast();

  const emptyForm = {
    customerName: '',
    city: 'Delhi NCR',
    rating: 5,
    transformationGoal: 'Muscle Building',
    duration: '12 Weeks',
    gainMetric: '+5.8 KG Lean Muscle',
    productUsed: 'NitroTech Whey Gold',
    title: '',
    comment: '',
    beforeImage: '',
    afterImage: '',
    isFeatured: true,
    likes: 18
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getReviews();
      if (res && res.reviews) {
        setReviews(res.reviews);
      }
    } catch (err) {
      addToast('Failed to load reviews and transformations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id || item.id);
    setFormData({
      customerName: item.customerName || '',
      city: item.city || 'India',
      rating: Number(item.rating) || 5,
      transformationGoal: item.transformationGoal || 'Muscle Building',
      duration: item.duration || '12 Weeks',
      gainMetric: item.gainMetric || '',
      productUsed: item.productUsed || '',
      title: item.title || '',
      comment: item.comment || '',
      beforeImage: item.beforeImage || '',
      afterImage: item.afterImage || '',
      isFeatured: Boolean(item.isFeatured),
      likes: Number(item.likes) || 12
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the transformation/review of "${name}"?`)) {
      return;
    }
    try {
      await api.deleteReview(id);
      addToast('Transformation / Review deleted successfully', 'success');
      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (err) {
      addToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(field);

      // Instant local preview using FileReader
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        // Also show immediate preview if server is slow
      };
      reader.readAsDataURL(file);

      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await api.uploadImage(uploadData);
      const url = res?.imageUrl || res?.url;
      if (url) {
        const fullUrl = resolveImg(url);
        setFormData((prev) => ({ ...prev, [field]: fullUrl }));
        addToast('Photo uploaded and ready!', 'success');
      }
    } catch (err) {
      addToast('Upload failed. You can also paste an image URL.', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.comment || !formData.productUsed) {
      addToast('Please fill out Customer Name, Product Used, and Comment', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await api.updateReview(editingId, formData);
        addToast('Transformation / Review updated successfully!', 'success');
      } else {
        await api.createReview(formData);
        addToast('New transformation / review published live!', 'success');
      }
      setIsModalOpen(false);
      fetchReviews();
    } catch (err) {
      addToast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const isTransformation = Boolean(r.beforeImage || r.afterImage);
    if (filterType === 'transformations' && !isTransformation) return false;
    if (filterType === 'reviews' && isTransformation) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (r.customerName || '').toLowerCase().includes(q);
      const matchProd = (r.productUsed || '').toLowerCase().includes(q);
      const matchComment = (r.comment || '').toLowerCase().includes(q);
      const matchCity = (r.city || '').toLowerCase().includes(q);
      return matchName || matchProd || matchComment || matchCity;
    }
    return true;
  });

  const transformationCount = reviews.filter((r) => r.beforeImage || r.afterImage).length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Social Proof & Conversions
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Real Customer Transformations & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Control the Before & After transformation cards, customer photos, gains badges, star ratings, and community reviews that appear on your storefront homepage and /reviews page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Transformation / Review</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cards</span>
            <span className="text-2xl font-black text-white block mt-1">{reviews.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Before & After Stories</span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">{transformationCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Status</span>
            <span className="text-xs font-bold text-cyan-400 block mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Auto-Synced via WebSockets
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, product, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilterType('transformations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'transformations'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Before/After Cards ({transformationCount})
          </button>
          <button
            onClick={() => setFilterType('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'reviews'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Standard Reviews ({reviews.length - transformationCount})
          </button>
        </div>
      </div>

      {/* Main Grid List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-bold">Loading customer transformations...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No items found</h3>
          <p className="text-xs text-slate-400">Click "+ Add Transformation / Review" to create your first story.</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-black hover:bg-cyan-400 cursor-pointer"
          >
            + Create First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((r) => {
            const isTransformation = Boolean(r.beforeImage && r.afterImage);

            return (
              <div
                key={r._id || r.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between group shadow-xl"
              >
                {/* Visual Header / Before After photos */}
                {r.beforeImage && r.afterImage ? (
                  <div className="relative grid grid-cols-2 gap-1 p-2 bg-slate-950">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900">
                      <img src={resolveImg(r.beforeImage)} alt="Before" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black/85 text-slate-300">
                        Before
                      </span>
                    </div>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900">
                      <img src={resolveImg(r.afterImage)} alt="After" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-black">
                        {r.duration || '12 Wks'}
                      </span>
                    </div>
                  </div>
                ) : (r.beforeImage || r.afterImage) ? (
                  <div className="p-2 bg-slate-950">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                      <img
                        src={resolveImg(r.beforeImage || r.afterImage)}
                        alt="Transformation"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-black">
                        {r.duration || 'Verified Result'}
                      </span>
                      {r.gainMetric && (
                        <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-black">
                          {r.gainMetric}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      Standard Review
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{r.city || 'India'}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{r.customerName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      {r.gainMetric && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {r.gainMetric}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 my-1.5">
                      <div className="flex text-amber-400">
                        {[...Array(Math.min(5, Math.max(1, Number(r.rating) || 5)))].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {r.transformationGoal || 'Muscle Building'}
                      </span>
                    </div>

                    {r.title && (
                      <h4 className="font-bold text-white text-xs line-clamp-1 mt-1">{r.title}</h4>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mt-1">
                      "{r.comment}"
                    </p>
                  </div>

                  {/* Product & Action Row */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 block">Product:</span>
                      <span className="text-xs font-bold text-emerald-400 truncate block">
                        {r.productUsed}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Edit Card"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id || r.id, r.customerName)}
                        className="p-2 rounded-xl bg-slate-800 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <ModalPortal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
        className="bg-slate-900 border-slate-800"
      >
        <div className="relative p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(100dvh-32px)]">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {editingId ? 'Edit Transformation Story' : 'New Transformation / Review'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {editingId ? 'Update Customer Result' : 'Publish Customer Transformation'}
            </h2>
            <p className="text-xs text-slate-400">
              Any changes made here reflect instantly across your homepage and the Customer Results page.
            </p>
          </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* Row 1: Customer Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Deep Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR, Jaipur, Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Row 2: Product Used & Gain Metric Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Product / Supplement Used *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NitroTech Whey Gold or Wellcore Creatine"
                    value={formData.productUsed}
                    onChange={(e) => setFormData({ ...formData, productUsed: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Gain / Result Badge (Homepage card)</label>
                  <input
                    type="text"
                    placeholder="e.g. +5.8 KG Lean Muscle, -7.4 KG Fat Loss"
                    value={formData.gainMetric}
                    onChange={(e) => setFormData({ ...formData, gainMetric: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Row 3: Duration & Objective & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Duration (Badge)</label>
                  <input
                    type="text"
                    placeholder="e.g. 16 Weeks, 12 Weeks, 8 Weeks"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Fitness Objective</label>
                  <select
                    value={formData.transformationGoal}
                    onChange={(e) => setFormData({ ...formData, transformationGoal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {GOAL_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Star Rating (1-5)</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Headline & Testimonial Quote */}
              <div>
                <label className="block font-bold mb-1.5 text-slate-300">Review Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mind-muscle connection is crazy, no jittery crash"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5 text-slate-300">Customer Testimonial / Story *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Mixability is super smooth, no bloating. Bench increased to 95kg with 100% genuine supplements."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Row 5: Before & After Photos (Upload or URL) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> Before & After Photos (For Transformation Cards)
                  </span>
                  <span className="text-[11px] text-slate-500">Provide both to show in Before/After slider</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photo */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-300">Before Photo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={formData.beforeImage}
                        onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <label className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'beforeImage')}
                        />
                      </label>
                    </div>
                    {formData.beforeImage && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 mt-2 bg-slate-900">
                        <img src={resolveImg(formData.beforeImage)} alt="Before Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* After Photo */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-300">After Photo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={formData.afterImage}
                        onChange={(e) => setFormData({ ...formData, afterImage: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <label className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'afterImage')}
                        />
                      </label>
                    </div>
                    {formData.afterImage && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 mt-2 bg-slate-900">
                        <img src={resolveImg(formData.afterImage)} alt="After Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-black shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Save Changes' : 'Publish Story'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </ModalPortal>
    </div>
  );
}
