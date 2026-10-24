import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Image } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, form);
        addToast('Category updated!');
      } else {
        await api.post('/categories', form);
        addToast('Category created!');
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/categories/${deleteId}`);
      addToast('Category removed');
      setDeleteId(null);
      await fetchCategories();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading marketplace categories..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Category Taxonomy Management</h2>
          <p className="text-xs text-slate-500 mt-1">Configure marketplace classification hierarchy</p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} icon={Plus}>
          Add Category
        </Button>
      </div>

      <Table headers={['Category', 'Slug Identifier', 'Description', 'Active Products', 'Actions']}>
        {categories.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={c.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={c.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <span className="font-bold text-slate-900 text-xs">{c.name}</span>
              </div>
            </td>

            <td className="px-6 py-4 font-mono text-slate-500 text-xs">
              {c.slug}
            </td>

            <td className="px-6 py-4 text-xs text-slate-500 max-w-sm truncate">
              {c.description || '—'}
            </td>

            <td className="px-6 py-4 font-bold text-slate-800 text-xs">
              {c._count?.products || 0} active SKUs
            </td>

            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Smart Electronics"
            required
          />

          <Input
            label="Cover Image URL"
            type="url"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category?"
      />
    </div>
  );
};

export default AdminCategoriesPage;
