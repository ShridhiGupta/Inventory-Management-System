import React, { useEffect, useMemo, useState } from 'react';
import { Activity, X } from 'lucide-react';
import api from '../../../lib/api';
import { getApiErrorMessage } from '../../../lib/http';

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  category: '',
  brand: '',
  hsnCode: '',
  gstRate: 18,
  costPrice: '',
  sellingPrice: '',
  mrp: '',
  currentStock: 0,
  reorderLevel: 10,
  description: ''
};

export default function ProductFormModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError('');
    setLoadingOptions(true);

    Promise.all([
      api.get('/catalog/categories'),
      api.get('/catalog/brands')
    ])
      .then(([categoryRes, brandRes]) => {
        if (cancelled) return;
        const nextCategories = categoryRes.data.categories || [];
        const nextBrands = brandRes.data.brands || [];
        setCategories(nextCategories);
        setBrands(nextBrands);
        setForm({
          ...emptyForm,
          category: nextCategories[0]?._id || '',
          brand: nextBrands[0]?._id || ''
        });
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load category and brand options.'));
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const canSubmit = useMemo(() => {
    return form.name && form.sku && form.category && form.brand && form.costPrice !== '' && form.sellingPrice !== '';
  }, [form]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'sku' ? value.toUpperCase().replace(/\s+/g, '_') : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setError('');

    const sku = form.sku.trim();
    const barcode = form.barcode.trim();
    const hsnCode = form.hsnCode.trim();

    if (!/^[A-Z0-9_-]+$/.test(sku)) {
      setSaving(false);
      setError('SKU can only use uppercase letters, numbers, hyphens, and underscores.');
      return;
    }

    if (barcode && (barcode.length < 8 || barcode.length > 20)) {
      setSaving(false);
      setError('Barcode must be 8-20 characters, or leave it blank.');
      return;
    }

    if (hsnCode && !/^[0-9]{4,8}$/.test(hsnCode)) {
      setSaving(false);
      setError('HSN code must be 4-8 digits, or leave it blank.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku,
      category: form.category,
      brand: form.brand,
      gstRate: Number(form.gstRate),
      pricing: {
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        mrp: form.mrp === '' ? Number(form.sellingPrice) : Number(form.mrp)
      },
      inventory: {
        currentStock: Number(form.currentStock) || 0,
        reorderLevel: Number(form.reorderLevel) || 0
      }
    };

    if (barcode) payload.barcode = barcode;
    if (hsnCode) payload.hsnCode = hsnCode;
    if (form.description.trim()) payload.description = form.description.trim();

    try {
      const { data } = await api.post('/catalog/products', payload);
      onCreated?.(data.product);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create product.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">New product</h2>
            <p className="text-sm text-slate-400">Add a catalog item with pricing, tax, and stock defaults.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {loadingOptions ? (
            <div className="flex min-h-64 items-center justify-center text-slate-400">
              <Activity className="h-7 w-7 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Product name</span>
                  <input className="modern-input w-full" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">SKU</span>
                  <input className="modern-input w-full" value={form.sku} onChange={(e) => updateField('sku', e.target.value)} pattern="[A-Z0-9_-]+" title="Use uppercase letters, numbers, hyphens, or underscores." required />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Category</span>
                  <select className="modern-input w-full" value={form.category} onChange={(e) => updateField('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Brand</span>
                  <select className="modern-input w-full" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} required>
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>{brand.name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Cost price</span>
                  <input className="modern-input w-full" type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => updateField('costPrice', e.target.value)} required />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Selling price</span>
                  <input className="modern-input w-full" type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => updateField('sellingPrice', e.target.value)} required />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">MRP</span>
                  <input className="modern-input w-full" type="number" min="0" step="0.01" value={form.mrp} onChange={(e) => updateField('mrp', e.target.value)} placeholder="Defaults to selling price" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">GST rate</span>
                  <select className="modern-input w-full" value={form.gstRate} onChange={(e) => updateField('gstRate', e.target.value)}>
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Opening stock</span>
                  <input className="modern-input w-full" type="number" min="0" step="1" value={form.currentStock} onChange={(e) => updateField('currentStock', e.target.value)} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Reorder level</span>
                  <input className="modern-input w-full" type="number" min="0" step="1" value={form.reorderLevel} onChange={(e) => updateField('reorderLevel', e.target.value)} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">Barcode</span>
                  <input className="modern-input w-full" value={form.barcode} onChange={(e) => updateField('barcode', e.target.value)} minLength={8} maxLength={20} title="Use 8-20 characters, or leave this blank." />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-300">HSN code</span>
                  <input className="modern-input w-full" value={form.hsnCode} onChange={(e) => updateField('hsnCode', e.target.value)} pattern="[0-9]{4,8}" title="Use 4-8 digits, or leave this blank." />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-300">Description</span>
                <textarea className="modern-input min-h-24 w-full" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              </label>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving || loadingOptions}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Activity className="h-4 w-4 animate-spin" />}
              Create product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
