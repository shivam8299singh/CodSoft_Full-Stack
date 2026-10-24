import React, { useState, useEffect } from 'react';
import { Package, Search, Trash2, ExternalLink, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?limit=50&search=${encodeURIComponent(search)}`);
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      addToast('Product moderated and deleted.');
      setDeleteId(null);
      await fetchProducts();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Scanning marketplace catalog..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Product Moderation</h2>
          <p className="text-xs text-slate-500 mt-1">Supervise product quality, listings compliance, and merchant pricing</p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-white"
          />
        </form>
      </div>

      <Table headers={['Product', 'Vendor / Seller', 'Category', 'Price', 'Stock', 'Actions']}>
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={p.name}
                  className="w-10 h-10 object-cover rounded-xl border border-slate-100 shrink-0"
                />
                <div>
                  <Link to={`/products/${p.id}`} className="font-bold text-slate-900 text-xs hover:text-indigo-600 block line-clamp-1">
                    {p.name}
                  </Link>
                  <span className="text-[11px] font-mono text-slate-400">{p.sku}</span>
                </div>
              </div>
            </td>

            <td className="px-6 py-4">
              <span className="font-bold text-indigo-700 text-xs flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                {p.vendor?.businessName}
              </span>
            </td>

            <td className="px-6 py-4 text-xs font-semibold text-slate-600">
              {p.category?.name}
            </td>

            <td className="px-6 py-4 font-bold text-slate-900 text-xs">
              {formatCurrency(p.price)}
            </td>

            <td className="px-6 py-4 font-extrabold text-slate-700 text-xs">
              {p.inventory?.availableStock ?? 0} units
            </td>

            <td className="px-6 py-4">
              <button
                onClick={() => setDeleteId(p.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Moderate / Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </Table>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Moderate Product?"
        message="Are you sure you want to remove this product as an administrator?"
      />
    </div>
  );
};

export default AdminProductsPage;
