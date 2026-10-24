import { Edit, Layers, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { menuService } from '../../services/menuService';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await menuService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    reset({ name: '', description: '', image: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, formData);
        toast.success(`Updated category: ${formData.name}`);
      } else {
        await menuService.createCategory(formData);
        toast.success(`Created category: ${formData.name}`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await menuService.deleteCategory(deletingId);
      toast.success('Category deleted successfully');
      setIsConfirmOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Culinary Categories</h1>
          <p className="text-xs text-slate-500">Organize and manage menu catalog groupings</p>
        </div>

        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No categories found"
          description="Create your first food category to start grouping dishes."
          actionText="Add Category"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Dishes Count</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                          alt={cat.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <span className="font-bold text-slate-900 text-sm font-serif">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">{cat.slug}</td>
                    <td className="px-5 py-4 max-w-sm truncate text-slate-600">
                      {cat.description || '—'}
                    </td>
                    <td className="px-5 py-4 font-bold text-amber-600">
                      {cat._count?.menuItems || 0} Dishes
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-400 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(cat.id);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Wood-Fired Pizza"
            {...register('name', { required: 'Category name is required' })}
            error={errors.name?.message}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary for menu card..."
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              {...register('description')}
            />
          </div>

          <Input
            label="Cover Image URL"
            placeholder="https://images.unsplash.com/..."
            {...register('image')}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? Associated menu items may need reassignment."
        confirmText="Yes, Delete"
        isDanger={true}
      />
    </div>
  );
};

export default AdminCategoriesPage;
