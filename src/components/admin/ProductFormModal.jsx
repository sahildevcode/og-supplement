import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProductFormModal({ isOpen, onClose, productToEdit, onSaved }) {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Protein',
    description: '',
    price: '',
    discountPrice: '',
    stock: '20',
    lowStockThreshold: '10',
    images: [''],
    variants: '1 kg, 2 kg',
    flavours: 'Rich Chocolate, Vanilla',
    ingredients: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        brand: productToEdit.brand || '',
        category: productToEdit.category || 'Protein',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        discountPrice: productToEdit.discountPrice || '',
        stock: String(productToEdit.stock !== undefined ? productToEdit.stock : '20'),
        lowStockThreshold: String(productToEdit.lowStockThreshold || '10'),
        images: productToEdit.images?.length ? productToEdit.images : ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'],
        variants: Array.isArray(productToEdit.variants) ? productToEdit.variants.join(', ') : '',
        flavours: Array.isArray(productToEdit.flavours) ? productToEdit.flavours.join(', ') : '',
        ingredients: productToEdit.ingredients || '',
      });
    } else {
      setFormData({
        name: '',
        brand: 'Optimum Nutrition',
        category: 'Protein',
        description: '',
        price: '',
        discountPrice: '',
        stock: '20',
        lowStockThreshold: '10',
        images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'],
        variants: '1 kg, 2 kg',
        flavours: 'Rich Chocolate, Vanilla Ice Cream',
        ingredients: '',
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (idx, value) => {
    const updated = [...formData.images];
    updated[idx] = value;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (idx) => {
    const updated = formData.images.filter((_, i) => i !== idx);
    setFormData({ ...formData, images: updated.length ? updated : [''] });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(data);
      if (res.success && res.imageUrl) {
        setFormData({
          ...formData,
          images: [res.imageUrl, ...formData.images.filter(Boolean)],
        });
        addToast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.brand || !formData.price || !formData.description) {
      setError('Please fill in all mandatory product information.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice || formData.price),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold || 10),
        images: formData.images.filter(Boolean),
        variants: formData.variants ? formData.variants.split(',').map((s) => s.trim()).filter(Boolean) : ['Standard'],
        flavours: formData.flavours ? formData.flavours.split(',').map((s) => s.trim()).filter(Boolean) : ['Unflavored'],
        ingredients: formData.ingredients.trim(),
      };

      if (productToEdit) {
        const id = productToEdit._id || productToEdit.id;
        await api.updateProduct(id, payload);
        addToast('Product updated successfully and broadcasted in real time!', 'success');
      } else {
        await api.createProduct(payload);
        addToast('New product added and broadcasted to customer store!', 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['Protein', 'Mass Gainer', 'Creatine', 'Pre-Workout', 'Supplements', 'Vitamins', 'Protein Bars'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white">
              {productToEdit ? 'Edit Supplement Product' : 'Add New Supplement Product'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Changes will instantly propagate to all active customer browsers via Socket.IO
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          {/* Row 1: Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Gold Standard 100% Whey"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Brand Name *</label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Optimum Nutrition / MuscleBlaze"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Row 2: Category & Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Low Stock Alert Threshold</label>
              <input
                type="number"
                name="lowStockThreshold"
                min="1"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Row 3: Pricing & Stock (Real-time sync test targets) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">MRP Price (₹) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="3899"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-emerald-400 uppercase tracking-wider text-xs">Selling Price (₹) *</label>
              <input
                type="number"
                name="discountPrice"
                required
                min="0"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="3199"
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3.5 py-2 text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-cyan-400 uppercase tracking-wider text-xs">Initial Live Stock (Units) *</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="25"
                className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-3.5 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Product Description *</label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="High potency protein formula supporting rapid post-workout hypertrophy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Variants & Flavours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Variants / Sizes (Comma separated)</label>
              <input
                type="text"
                name="variants"
                value={formData.variants}
                onChange={handleChange}
                placeholder="1 kg, 2 kg, 4 kg"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Flavours (Comma separated)</label>
              <input
                type="text"
                name="flavours"
                value={formData.flavours}
                onChange={handleChange}
                placeholder="Double Rich Chocolate, Vanilla Ice Cream"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Image URLs & Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-xs">Product Images (URLs or Upload)</label>
              <label className="cursor-pointer px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {formData.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addImageField}
              className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1 pt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Image URL
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-950/60 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Broadcasting Update...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{productToEdit ? 'Save & Sync Live' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
