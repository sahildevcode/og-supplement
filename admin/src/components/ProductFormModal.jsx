import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAdminToast } from '../context/AdminToastContext';

export default function ProductFormModal({ isOpen, onClose, product, onSave }) {
  const { addToast } = useAdminToast();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Protein',
    price: '',
    discountPrice: '',
    stock: '',
    lowStockThreshold: 5,
    description: '',
    ingredients: '',
    images: ['', '', '', ''],
    variants: ['Standard 1kg'],
    flavours: ['Chocolate']
  });

  const [saving, setSaving] = useState(false);

  const ensureFourImages = (imgs) => {
    const list = Array.isArray(imgs) ? imgs.filter(Boolean) : [];
    while (list.length < 4) {
      list.push('');
    }
    return list;
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || 'Protein',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stock: product.stock || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        description: product.description || '',
        ingredients: product.ingredients || '',
        images: ensureFourImages(product.images),
        variants: product.variants?.length ? product.variants : ['Standard 1kg'],
        flavours: product.flavours?.length ? product.flavours : ['Chocolate']
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        category: 'Protein',
        price: '',
        discountPrice: '',
        stock: 20,
        lowStockThreshold: 5,
        description: '',
        ingredients: '',
        images: [
          'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
        ],
        variants: ['2 lbs (907g)', '5 lbs (2.27kg)'],
        flavours: ['Double Rich Chocolate', 'Vanilla Ice Cream']
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : Number(formData.price),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        variants: formData.variants.filter(Boolean),
        flavours: formData.flavours.filter(Boolean),
        images: formData.images.filter(Boolean)
      };

      if (isEditing) {
        const id = product._id || product.id;
        const res = await api.updateProduct(id, payload);
        addToast(`Updated product: ${payload.name}`, 'success');
        onSave(res.product || payload);
      } else {
        const res = await api.createProduct(payload);
        addToast(`Created product: ${payload.name}`, 'success');
        onSave(res.product || payload);
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            {isEditing ? 'Edit Supplement Product' : 'Add New Supplement'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-300">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Optimum Nutrition Gold Standard 100% Whey"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Brand Name *</label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="Optimum Nutrition / MuscleBlaze"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {['Protein', 'Mass Gainer', 'Creatine', 'Pre-Workout', 'Supplements', 'Vitamins', 'Protein Bars'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Original MRP (₹) *</label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="3899"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Discounted Selling Price (₹) *</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="3199"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Current Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                required
                value={formData.stock}
                onChange={handleChange}
                placeholder="25"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Low Stock Alert Threshold</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                placeholder="5"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Product Images: 4 Angle Slots */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Product Image Angles (Minimum 3-4 Images)
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">Front, Nutrition Label, Powder Scoop & Packaging</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      {idx === 0
                        ? 'Main Front View'
                        : idx === 1
                        ? 'Nutrition Facts / Label'
                        : idx === 2
                        ? 'Scoop / Powder Serving'
                        : idx === 3
                        ? 'Authenticity Seal / Box'
                        : `Angle Image ${idx + 1}`}
                    </span>
                    {formData.images.length > 4 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('images', idx)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={img}
                    onChange={(e) => handleArrayChange('images', idx, e.target.value)}
                    placeholder={`Paste image URL for angle ${idx + 1}...`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                  />

                  {/* Live Image Preview */}
                  <div className="w-full h-24 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-[11px] text-slate-600 font-medium">No Image URL</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addArrayItem('images')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 pt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Additional Image Angle
            </button>
          </div>

          {/* Variants & Flavours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Variants */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300">Size / Package Variants</label>
              {formData.variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={v}
                    onChange={(e) => handleArrayChange('variants', idx, e.target.value)}
                    placeholder="e.g. 2 lbs (907g)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button type="button" onClick={() => removeArrayItem('variants', idx)} className="p-1.5 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('variants')} className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Size
              </button>
            </div>

            {/* Flavours */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300">Available Flavors</label>
              {formData.flavours.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f}
                    onChange={(e) => handleArrayChange('flavours', idx, e.target.value)}
                    placeholder="e.g. Double Rich Chocolate"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button type="button" onClick={() => removeArrayItem('flavours', idx)} className="p-1.5 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('flavours')} className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Flavor
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-300">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed supplement specifications, BCAA profile, protein ratio..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Broadcasting to Server...' : isEditing ? 'Save & Sync Changes' : 'Create & Broadcast Product'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
