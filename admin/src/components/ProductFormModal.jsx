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
    images: [''],
    variants: ['Standard 1kg'],
    flavours: ['Chocolate']
  });

  const [saving, setSaving] = useState(false);

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
        images: product.images?.length ? product.images : [''],
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
        images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'],
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

          {/* Image URLs */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-300">Product Image URLs</label>
            {formData.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => handleArrayChange('images', idx, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('images', idx)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('images')}
              className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Image URL
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
