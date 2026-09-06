import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useAdminToast } from '../context/AdminToastContext';

const colorThemes = [
  { id: 'emerald', label: 'Emerald Green', bgClass: 'from-emerald-500/20 to-teal-500/5', borderClass: 'border-emerald-500/30' },
  { id: 'purple', label: 'Royal Purple', bgClass: 'from-purple-500/20 to-indigo-500/5', borderClass: 'border-purple-500/30' },
  { id: 'blue', label: 'Electric Blue', bgClass: 'from-blue-500/20 to-cyan-500/5', borderClass: 'border-cyan-500/30' },
  { id: 'amber', label: 'Amber Fire', bgClass: 'from-amber-500/20 to-orange-500/5', borderClass: 'border-amber-500/30' },
  { id: 'rose', label: 'Rose Pink', bgClass: 'from-rose-500/20 to-pink-500/5', borderClass: 'border-rose-500/30' },
  { id: 'teal', label: 'Teal Ocean', bgClass: 'from-teal-500/20 to-emerald-500/5', borderClass: 'border-teal-500/30' },
  { id: 'cyan', label: 'Cyan Neon', bgClass: 'from-cyan-500/20 to-blue-500/5', borderClass: 'border-cyan-500/30' },
  { id: 'orange', label: 'Citrus Orange', bgClass: 'from-orange-500/20 to-red-500/5', borderClass: 'border-orange-500/30' },
];

const presetSampleImages = [
  { name: 'Whey Protein (Gold Std)', url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mass Gainer (High Cal)', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80' },
  { name: 'Creatine Monohydrate', url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80' },
  { name: 'Pre-Workout Explosive', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80' },
  { name: 'BCAA & Amino Matrix', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80' },
  { name: 'Daily Multivitamins', url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80' }
];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Protein',
    title: '',
    desc: '',
    image: '',
    colorTheme: 'emerald',
    order: 1
  });

  const { addToast } = useAdminToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      if (res && res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('[Fetch Categories Error]', err);
      addToast('Could not load categories. Using local state.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleCreated = (newCat) => {
      setCategories((prev) => [...prev.filter((c) => (c._id || c.id) !== (newCat._id || newCat.id)), newCat].sort((a, b) => (a.order || 0) - (b.order || 0)));
    };

    const handleUpdated = (updatedCat) => {
      const targetId = updatedCat._id || updatedCat.id;
      setCategories((prev) => prev.map((c) => ((c._id || c.id) === targetId ? updatedCat : c)).sort((a, b) => (a.order || 0) - (b.order || 0)));
    };

    const handleDeleted = ({ categoryId }) => {
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== categoryId));
    };

    socket.on('category:created', handleCreated);
    socket.on('category:updated', handleUpdated);
    socket.on('category:deleted', handleDeleted);

    return () => {
      socket.off('category:created', handleCreated);
      socket.off('category:updated', handleUpdated);
      socket.off('category:deleted', handleDeleted);
    };
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: 'Protein',
      title: '',
      desc: '',
      image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80',
      colorTheme: 'emerald',
      order: categories.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      title: cat.title || '',
      desc: cat.desc || '',
      image: cat.image || '',
      colorTheme: cat.colorTheme || 'emerald',
      order: cat.order || 1
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.title || !formData.image) {
      addToast('Please fill in Name, Title, and Image URL', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id;
        const res = await api.updateCategory(id, formData);
        addToast(`Updated category "${formData.title}"`, 'success');
        if (res && res.category) {
          setCategories((prev) =>
            prev.map((c) => ((c._id || c.id) === id ? res.category : c)).sort((a, b) => (a.order || 0) - (b.order || 0))
          );
        }
      } else {
        const res = await api.createCategory(formData);
        addToast(`Created category "${formData.title}"`, 'success');
        if (res && res.category) {
          setCategories((prev) => [...prev, res.category].sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('[Save Category Error]', err);
      addToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the homepage? This will update the customer website immediately.`)) {
      return;
    }

    try {
      await api.deleteCategory(id);
      addToast(`Removed "${title}" from homepage`, 'success');
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error('[Delete Category Error]', err);
      addToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>Storefront Layout Customizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Homepage Category Sections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Control the 6 hero category cards on the homepage. Change product images (e.g. Optimum Nutrition, MuscleBlaze), edit descriptions, add new sections, or remove sections. Changes update on the live website instantly!
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 active:scale-95"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-60 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Category Cards Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "+ Add New Category" to create your first homepage section card.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-xl"
          >
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const id = cat._id || cat.id || `temp_${idx}`;
            const theme = colorThemes.find((t) => t.id === cat.colorTheme) || colorThemes[0];

            return (
              <div
                key={id}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${
                  cat.colorDark || theme.bgClass
                } border ${
                  cat.borderDark || theme.borderClass
                } p-6 flex flex-col justify-between min-h-[260px] shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-cyan-500/50`}
              >
                {/* Header Tag & Order Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/90 text-cyan-400 border border-slate-700">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900/70 px-2 py-0.5 rounded-md border border-slate-800">
                    Order #{cat.order || idx + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-1.5 my-3">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-[200px] line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                {/* Floating Product Image Preview */}
                <div className="absolute -right-3 -bottom-3 w-36 h-36 pointer-events-none opacity-90 group-hover:opacity-100 transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Card Actions */}
                <div className="relative z-10 pt-4 flex items-center justify-between border-t border-slate-800/80 mt-auto">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500 hover:text-black text-cyan-400 text-xs font-bold border border-slate-700 hover:border-cyan-400 transition-all active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Card</span>
                    </button>
                    <button
                      onClick={() => handleDelete(id, cat.title)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-bold border border-slate-700 hover:border-rose-400 transition-all active:scale-95"
                      title="Remove from Homepage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {theme.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {editingCategory ? 'Edit Homepage Category Card' : 'Add New Homepage Category'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize image, titles, and visual theme for this homepage section.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Name / Filter Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Category Tag / Filter
                  </label>
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Protein">Protein</option>
                    <option value="Mass Gainer">Mass Gainer</option>
                    <option value="Creatine">Creatine</option>
                    <option value="Pre-Workout">Pre-Workout</option>
                    <option value="Supplements">Supplements (BCAA)</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Peanut Butter">Peanut Butter</option>
                    <option value="Fish Oil">Fish Oil</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                {/* Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Display Order on Homepage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Card Display Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Whey & Isolate Protein, Micronized Creatine"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Short Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure muscle synthesis & fast recovery"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Image URL & Live Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Product Card Image URL
                  </label>
                  <span className="text-[11px] text-cyan-400 font-semibold">
                    Paste any product link or pick a preset below
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... (Direct image link of supplement tub/bottle)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ⚡ Quick Sample Images (Click to apply):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {presetSampleImages.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          formData.image === preset.url
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                {formData.image && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-1.5 shrink-0">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-contain filter drop-shadow"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Live Image Preview Loaded</span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">
                        URL: {formData.image}
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        This high-resolution cutout will float at the bottom-right corner of the card.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Card Color Theme & Background
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {colorThemes.map((theme) => {
                    const isSelected = formData.colorTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorTheme: theme.id })}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-bold ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${theme.bgClass}`} />
                        <span className="truncate">{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCategory ? 'Save & Update Live' : 'Create Category Card'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
