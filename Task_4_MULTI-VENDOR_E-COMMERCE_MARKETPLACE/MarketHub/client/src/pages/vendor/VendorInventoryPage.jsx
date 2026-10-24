import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, Check, RefreshCw, Save } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Table from '../../components/Table';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const VendorInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendor/inventory');
      if (res.data?.success) {
        setProducts(res.data.data);
        const map = {};
        res.data.data.forEach((p) => {
          map[p.id] = {
            stock: p.inventory?.currentStock ?? 0,
            threshold: p.inventory?.lowStockThreshold ?? 5,
          };
        });
        setStockInputs(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (productId) => {
    const values = stockInputs[productId];
    if (!values) return;

    try {
      setUpdatingId(productId);
      const res = await api.put(`/vendor/inventory/${productId}`, {
        stock: parseInt(values.stock, 10),
        lowStockThreshold: parseInt(values.threshold, 10),
      });

      if (res.data?.success) {
        addToast('Stock level updated successfully!');
        await fetchInventory();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading inventory status..." />;

  const lowStockCount = products.filter((p) => p.inventory?.status !== 'IN_STOCK').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory & Warehouse Control</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time SKU reservation, safety stock, and rapid restock adjustment
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchInventory} icon={RefreshCw}>
          Refresh Stocks
        </Button>
      </div>

      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Attention:</strong> {lowStockCount} product(s) are currently running low or out of stock! Restock to prevent lost sales.
          </span>
        </div>
      )}

      {/* Inventory Table */}
      <Table headers={['SKU & Product', 'Current Stock', 'Reserved (In-Flight)', 'Available', 'Threshold', 'Status', 'Quick Update']}>
        {products.map((p) => {
          const inv = p.inventory;
          const isLow = inv?.status !== 'IN_STOCK';

          return (
            <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-amber-50/20' : ''}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-xl border border-slate-100"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block truncate max-w-xs">{p.name}</span>
                    <span className="text-[11px] font-mono text-indigo-600 font-bold">{p.sku}</span>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <input
                  type="number"
                  min="0"
                  value={stockInputs[p.id]?.stock ?? ''}
                  onChange={(e) =>
                    setStockInputs({
                      ...stockInputs,
                      [p.id]: { ...stockInputs[p.id], stock: e.target.value },
                    })
                  }
                  className="w-20 text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-white text-slate-900"
                />
              </td>

              <td className="px-6 py-4 font-semibold text-slate-500 text-xs">
                {inv?.reservedStock ?? 0}
              </td>

              <td className="px-6 py-4">
                <span className="font-extrabold text-slate-900 text-xs">
                  {inv?.availableStock ?? 0} units
                </span>
              </td>

              <td className="px-6 py-4">
                <input
                  type="number"
                  min="1"
                  value={stockInputs[p.id]?.threshold ?? ''}
                  onChange={(e) =>
                    setStockInputs({
                      ...stockInputs,
                      [p.id]: { ...stockInputs[p.id], threshold: e.target.value },
                    })
                  }
                  className="w-16 text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white text-slate-600"
                />
              </td>

              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  inv?.status === 'IN_STOCK'
                    ? 'bg-emerald-50 text-emerald-700'
                    : inv?.status === 'LOW_STOCK'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {inv?.status || 'IN_STOCK'}
                </span>
              </td>

              <td className="px-6 py-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStock(p.id)}
                  loading={updatingId === p.id}
                  icon={Save}
                >
                  Save
                </Button>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
};

export default VendorInventoryPage;
