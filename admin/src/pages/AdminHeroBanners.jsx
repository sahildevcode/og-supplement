import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  Layers,
  ArrowRight,
  Upload,
  CheckCircle2,
  MoveUp,
  MoveDown,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAdminToast } from '../context/AdminToastContext';

const colorPresets = [
  { name: 'Cyan / Blue (Creatine)', color: 'from-cyan-500 to-blue-500', dark: 'from-blue-950/70 via-slate-900/90 to-slate-950', light: 'from-cyan-100/80 via-slate-50 to-white' },
  { name: 'Emerald / Teal (Protein)', color: 'from-emerald-500 to-teal-400', dark: 'from-emerald-950/70 via-slate-900/90 to-slate-950', light: 'from-emerald-100/80 via-slate-50 to-white' },
  { name: 'Amber / Orange (Pre-Workout)', color: 'from-amber-500 to-orange-500', dark: 'from-amber-950/60 via-slate-900/90 to-slate-950', light: 'from-amber-100/80 via-slate-50 to-white' },
  { name: 'Purple / Indigo (Mass Gainer)', color: 'from-purple-500 to-indigo-500', dark: 'from-purple-950/60 via-slate-900/90 to-slate-950', light: 'from-purple-100/80 via-slate-50 to-white' },
  { name: 'Rose / Red (Fat Burner)', color: 'from-rose-500 to-red-500', dark: 'from-rose-950/60 via-slate-900/90 to-slate-950', light: 'from-rose-100/80 via-slate-50 to-white' },
];

export default function AdminHeroBanners() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const { addToast } = useAdminToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.getHeroBanners();
      if (res && res.slides && Array.isArray(res.slides)) {
        setSlides(res.slides);
      }
    } catch (err) {
      addToast('Could not load hero banners from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const handlePresetChange = (index, preset) => {
    const updated = [...slides];
    updated[index] = {
      ...updated[index],
      badgeColor: preset.color,
      gradientDark: preset.dark,
      gradientLight: preset.light
    };
    setSlides(updated);
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    try {
      setUploadingIndex(index);
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadImage(formData);
      if (res && res.url) {
        handleFieldChange(index, 'image', res.url);
        addToast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingIndex(null);
    }
  };

  const addNewSlide = () => {
    const newSlide = {
      id: Date.now(),
      category: 'General',
      tagline: 'OFFICIAL OG SUPPLEMENT PROMISE',
      title: 'Fuel Your Performance & Gains',
      subtitle: 'Premium certified raw ingredients formulated for elite athletic recovery and maximum peak output.',
      cta: 'Explore Products',
      image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=900&auto=format&fit=crop&q=80',
      badge: 'New Formula',
      badgeColor: 'from-cyan-500 to-blue-500',
      discount: 'Special Launch Offer',
      gradientDark: 'from-blue-950/70 via-slate-900/90 to-slate-950',
      gradientLight: 'from-cyan-100/80 via-slate-50 to-white'
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
    addToast('New slide added. Edit details below and click Save Changes.', 'info');
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) {
      addToast('At least 1 hero banner slide is required!', 'warning');
      return;
    }
    if (window.confirm('Are you sure you want to delete this slide?')) {
      const updated = slides.filter((_, i) => i !== index);
      setSlides(updated);
      setActiveSlideIndex(Math.max(0, index - 1));
      addToast('Slide deleted', 'info');
    }
  };

  const moveSlide = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSlides(updated);
    setActiveSlideIndex(targetIndex);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateHeroBanners(slides);
      addToast('Hero Banners saved & live synced to homepage!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save hero banners', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-cyan-400 mb-3" />
        <p className="text-sm font-semibold">Loading Hero Banner Settings...</p>
      </div>
    );
  }

  const activeSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Storefront Visual Customizer</span>
          </div>
          <h1 className="text-2xl font-black text-white">Hero Slider & Banner Editor</h1>
          <p className="text-slate-400 text-xs mt-1">
            Edit text, headings, badges, discounts, buttons, and photos for the main homepage slideshow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addNewSlide}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Slide</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Save className="w-4 h-4 text-black" />
            )}
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            onClick={() => setActiveSlideIndex(idx)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex-shrink-0 ${
              activeSlideIndex === idx
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
              {idx + 1}
            </span>
            <span>{s.category || `Slide ${idx + 1}`}</span>
            {s.badge && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-300 font-normal">
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Slide Editor */}
      {activeSlide && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Edit Fields */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Editing Slide #{activeSlideIndex + 1}: {activeSlide.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => moveSlide(activeSlideIndex, -1)}
                    disabled={activeSlideIndex === 0}
                    title="Move Up / Earlier"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSlide(activeSlideIndex, 1)}
                    disabled={activeSlideIndex === slides.length - 1}
                    title="Move Down / Later"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSlide(activeSlideIndex)}
                    title="Delete this slide"
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={activeSlide.category || ''}
                    onChange={(e) => handleFieldChange(activeSlideIndex, 'category', e.target.value)}
                    placeholder="e.g. Creatine, Protein, Pre-Workout"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Top Badge (Pill)
                  </label>
                  <input
                    type="text"
                    value={activeSlide.badge || ''}
                    onChange={(e) => handleFieldChange(activeSlideIndex, 'badge', e.target.value)}
                    placeholder="e.g. Lab Verified Pure, Best Seller"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Tagline & Discount Pill */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Small Sub-Tagline
                  </label>
                  <input
                    type="text"
                    value={activeSlide.tagline || ''}
                    onChange={(e) => handleFieldChange(activeSlideIndex, 'tagline', e.target.value)}
                    placeholder="e.g. CREAPURE® GERMAN FORMULA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Offer / Discount Pill
                  </label>
                  <input
                    type="text"
                    value={activeSlide.discount || ''}
                    onChange={(e) => handleFieldChange(activeSlideIndex, 'discount', e.target.value)}
                    placeholder="e.g. Starting @ ₹699, Flat 20% OFF"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Main Headline (Explosive Strength & ATP Power) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Main Headline / Title (Large Text)
                </label>
                <input
                  type="text"
                  value={activeSlide.title || ''}
                  onChange={(e) => handleFieldChange(activeSlideIndex, 'title', e.target.value)}
                  placeholder="e.g. Explosive Strength & ATP Power"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Subtitle / Paragraph */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Body Description / Paragraph
                </label>
                <textarea
                  rows={3}
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => handleFieldChange(activeSlideIndex, 'subtitle', e.target.value)}
                  placeholder="Explain formula benefits, protein grams, or boost..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Button CTA Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Button Text (Call to Action)
                </label>
                <input
                  type="text"
                  value={activeSlide.cta || ''}
                  onChange={(e) => handleFieldChange(activeSlideIndex, 'cta', e.target.value)}
                  placeholder="e.g. Explore Micronized Creatine"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Slide Image (URL + Direct Upload) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Slide Image (Right Hero Banner Graphic)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeSlide.image || ''}
                    onChange={(e) => handleFieldChange(activeSlideIndex, 'image', e.target.value)}
                    placeholder="https://... or upload image"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer border border-slate-700">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{uploadingIndex === activeSlideIndex ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(activeSlideIndex, e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Theme & Color Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Color Theme & Glow Accent
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colorPresets.map((preset) => {
                    const isSelected = activeSlide.badgeColor === preset.color;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetChange(activeSlideIndex, preset)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-500 text-white shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${preset.color} flex-shrink-0`} />
                        <span className="text-[11px] font-semibold truncate">{preset.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Live Preview (As Customers See)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Active Card
                </span>
              </div>

              {/* Mini Banner Frame */}
              <div className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br ${activeSlide.gradientDark || 'from-slate-900 to-slate-950'} p-5 text-white shadow-2xl`}>
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {activeSlide.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${activeSlide.badgeColor || 'from-cyan-500 to-blue-500'} text-black shadow-sm`}>
                      ✨ {activeSlide.badge}
                    </span>
                  )}
                  {activeSlide.discount && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/90 text-cyan-300 border border-cyan-500/30">
                      {activeSlide.discount}
                    </span>
                  )}
                </div>

                {/* Sub-tagline */}
                <div className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                  {activeSlide.tagline || 'OG SUPPLEMENT OFFICIAL'}
                </div>

                {/* Title */}
                <h3 className="text-lg font-black text-white leading-tight mb-2">
                  {activeSlide.title || 'Explosive Strength & ATP Power'}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {activeSlide.subtitle || 'Zero fillers, zero bloat. Scientifically proven formula.'}
                </p>

                {/* Image & Button */}
                <div className="relative h-36 rounded-xl overflow-hidden mb-4 border border-slate-700/50 bg-black/40">
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=900&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{activeSlide.cta || 'Explore Now'}</span>
                  </button>
                  <button className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                    All Products
                  </button>
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  After clicking <strong>Save & Publish Live</strong>, changes sync instantly to the homepage and customer browsers without refreshing!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
