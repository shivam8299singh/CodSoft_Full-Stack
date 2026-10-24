import {
  Edit,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { menuService } from '../../services/menuService';

const AdminMenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [items, cats] = await Promise.all([
        menuService.getMenuItems({
          search,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }),
        menuService.getCategories(),
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    reset({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id || '',
      ingredients: '',
      imageUrl: '',
      prepTime: 20,
      isVegetarian: false,
      isAvailable: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    reset({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      ingredients: item.ingredients || '',
      imageUrl: item.imageUrl,
      prepTime: item.prepTime || 20,
      isVegetarian: item.isVegetarian,
      isAvailable: item.isAvailable,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        ingredients: formData.ingredients,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        prepTime: parseInt(formData.prepTime, 10),
        isVegetarian: Boolean(formData.isVegetarian),
        isAvailable: Boolean(formData.isAvailable),
      };

      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, payload);
        toast.success(`Updated ${payload.name}`);
      } else {
        await menuService.createMenuItem(payload);
        toast.success(`Created ${payload.name}`);
      }
      setIsFormModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuService.toggleAvailability(item.id);
      toast.success(`${item.name} availability toggled`);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle availability');
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingId) return;
    try {
      await menuService.deleteMenuItem(deletingId);
      toast.success('Menu item deleted');
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Menu Catalog Management</h1>
          <p className="text-xs text-slate-500">Add, edit pricing, ingredients, and availability of gourmet dishes</p>
        </div>

        <Button onClick={handleOpenAddModal} icon={Plus}>
          Add New Dish
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={fetchData} icon={RefreshCw}>
            Filter
          </Button>
        </div>
      </div>

      {/* Menu Items Table */}
      {loading ? (
        <LoadingSpinner text="Loading dishes catalog..." />
      ) : menuItems.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items found"
          description="Try different search terms or click Add New Dish to expand your menu."
          actionText="Add New Dish"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Dish</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm font-serif">
                            {item.name}
                          </p>
                          <p className="text-slate-400 text-[11px] line-clamp-1 max-w-xs">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {item.category?.name}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-900 font-sans text-sm">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          item.isVegetarian
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {item.isVegetarian ? 'Pure Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border cursor-pointer transition ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-400 transition"
                          aria-label="Edit item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(item.id);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-400 transition"
                          aria-label="Delete item"
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

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? 'Edit Culinary Dish' : 'Add New Culinary Dish'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Dish Name"
            placeholder="e.g. Truffle Infused Risotto"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 499"
              {...register('price', { required: 'Price is required' })}
              error={errors.price?.message}
            />

            <Select
              label="Culinary Category"
              {...register('categoryId', { required: 'Category is required' })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Flavor notes, cooking method, garnish..."
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              {...register('description', { required: 'Description is required' })}
            />
          </div>

          <Input
            label="Key Ingredients (Comma-separated)"
            placeholder="e.g. Arborio rice, white truffle oil, parmesan, wild mushrooms"
            {...register('ingredients')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Image URL"
              placeholder="https://images.unsplash.com/..."
              {...register('imageUrl')}
            />

            <Input
              label="Estimated Prep Time (Minutes)"
              type="number"
              placeholder="20"
              {...register('prepTime')}
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                {...register('isVegetarian')}
              />
              Pure Vegetarian Dish
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                {...register('isAvailable')}
              />
              Available for Ordering
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingItem ? 'Save Changes' : 'Create Dish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Menu Item?"
        message="Are you sure you want to permanently remove this dish from the restaurant menu?"
        confirmText="Yes, Delete"
        isDanger={true}
      />
    </div>
  );
};

export default AdminMenuPage;
