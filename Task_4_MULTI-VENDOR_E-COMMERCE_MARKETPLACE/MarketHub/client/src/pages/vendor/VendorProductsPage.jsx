import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, Package } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

export const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    brand: '',
    sku: '',
    categoryId: '',
    stock: '15',
    lowStockThreshold: '5',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/vendor/inventory'),
        api.get('/categories'),
      ]);
      if (prodRes.data?.success) setProducts(prodRes.data.data);
      if (catRes.data?.success) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '0',
      brand: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      categoryId: categories[0]?.id || '',
      stock: '20',
      lowStockThreshold: '5',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: String(p.price),
      discount: String(p.discount || 0),
      brand: p.brand || '',
      sku: p.sku,
      categoryId: p.categoryId,
      stock: String(p.inventory?.currentStock || 0),
      lowStockThreshold: String(p.inventory?.lowStockThreshold || 5),
      imageUrl: p.images?.[0]?.url || '',
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        brand: formData.brand,
        sku: formData.sku,
        categoryId: formData.categoryId,
        stock: parseInt(formData.stock, 10) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 5,
        images: formData.imageUrl ? [{ url: formData.imageUrl }] : [],
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        addToast('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        addToast('Product created and listed successfully!');
      }

      setModalOpen(false);
      await fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${deleteId}`);
      addToast('Product deleted from inventory');
      setDeleteId(null);
      await fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading vendor catalog..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, modify pricing, stock levels, and merchandise details
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} icon={Plus}>
          Add New Product
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{filteredProducts.length} Products</span>
      </div>

      {/* Products Table */}
      <Table headers={['Product', 'Category', 'Price', 'Stock Level', 'Status', 'Actions']}>
        {filteredProducts.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate max-w-xs">{p.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</span>
                </div>
              </div>
            </td>

            <td className="px-6 py-4 text-xs font-semibold text-slate-600">
              {p.category?.name || 'General'}
            </td>

            <td className="px-6 py-4">
              <span className="font-bold text-slate-900 text-xs">{formatCurrency(p.price)}</span>
              {p.discount > 0 && (
                <span className="block text-[10px] text-emerald-600 font-bold">-{p.discount}% OFF</span>
              )}
            </td>

            <td className="px-6 py-4">
              <span className="font-extrabold text-slate-800 text-xs">
                {p.inventory?.availableStock ?? 0} units
              </span>
            </td>

            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                p.inventory?.status === 'IN_STOCK'
                  ? 'bg-emerald-50 text-emerald-700'
                  : p.inventory?.status === 'LOW_STOCK'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}>
                {p.inventory?.status || 'IN_STOCK'}
              </span>
            </td>

            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(p.id)}
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Marketplace Product' : 'Add New Product to Store'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. UltraBook Pro 15 M3 Laptop"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Brand Name"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. AeroTech"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="4999"
              required
            />
            <Input
              label="Discount (%)"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              placeholder="10"
            />
            <Input
              label="SKU Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="TP-001"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Inventory Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
            <Input
              label="Low Stock Warning Threshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              required
            />
          </div>

          <Input
            label="Product Image URL (CDN or Unsplash)"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail key specifications, build materials, warranty, and seller assurance..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product?"
        message="Are you sure you want to remove this product from the marketplace? Active order history will remain preserved."
      />
    </div>
  );
};

export default VendorProductsPage;
