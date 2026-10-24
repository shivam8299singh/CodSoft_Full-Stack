import { Edit, Grid, Plus, Trash2, Users } from 'lucide-react';
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
import { tableService } from '../../services/tableService';
import { TABLE_STATUS_LABELS } from '../../utils/constants';

const AdminTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
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

  const fetchTables = async () => {
    setLoading(true);
    try {
      const data = await tableService.getTables();
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenAdd = () => {
    setEditingTable(null);
    const nextTableNum = tables.length > 0 ? Math.max(...tables.map((t) => t.tableNumber)) + 1 : 1;
    reset({
      tableNumber: nextTableNum,
      capacity: 4,
      location: 'Indoor',
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTable(t);
    reset({
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      location: t.location,
      status: t.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        tableNumber: parseInt(formData.tableNumber, 10),
        capacity: parseInt(formData.capacity, 10),
        location: formData.location,
        status: formData.status,
      };

      if (editingTable) {
        await tableService.updateTable(editingTable.id, payload);
        toast.success(`Updated Table #${payload.tableNumber}`);
      } else {
        await tableService.createTable(payload);
        toast.success(`Created Table #${payload.tableNumber}`);
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to save table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (tableId, status) => {
    try {
      await tableService.updateTableStatus(tableId, status);
      toast.success(`Table status updated to ${status}`);
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to update table status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await tableService.deleteTable(deletingId);
      toast.success('Table deleted successfully');
      setIsConfirmOpen(false);
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to delete table');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Floor & Seating Layout</h1>
          <p className="text-xs text-slate-500">Configure dining tables, guest capacities, and floor zones</p>
        </div>

        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Table
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading seating setup..." />
      ) : tables.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="No dining tables setup"
          description="Add your first table to organize the floor plan and take reservations."
          actionText="Add Table"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Table Number</th>
                  <th className="px-5 py-3.5">Capacity</th>
                  <th className="px-5 py-3.5">Floor Zone</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tables.map((t) => {
                  const statusInfo = TABLE_STATUS_LABELS[t.status] || {
                    label: t.status,
                    color: 'bg-slate-100 text-slate-800 border-slate-200',
                  };

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 font-bold text-slate-900 font-serif text-base">
                        Table #{t.tableNumber}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {t.capacity} Guests
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">
                        {t.location}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-xs cursor-pointer focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="RESERVED">Reserved</option>
                          <option value="OCCUPIED">Occupied</option>
                          <option value="CLEANING">Cleaning</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-400 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(t.id);
                              setIsConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Table Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTable ? 'Edit Floor Table' : 'Add Floor Table'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Table Number"
            type="number"
            placeholder="e.g. 5"
            {...register('tableNumber', { required: 'Table number is required' })}
            error={errors.tableNumber?.message}
          />

          <Input
            label="Guest Capacity"
            type="number"
            placeholder="e.g. 4"
            {...register('capacity', { required: 'Capacity is required' })}
            error={errors.capacity?.message}
          />

          <Select
            label="Floor Zone / Ambiance"
            {...register('location', { required: 'Location is required' })}
          >
            <option value="Indoor">Indoor Dining Hall</option>
            <option value="Patio">Garden Patio</option>
            <option value="Rooftop">Panoramic Rooftop</option>
            <option value="VIP">VIP Private Salon</option>
          </Select>

          <Select label="Initial Status" {...register('status')}>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="CLEANING">Cleaning</option>
          </Select>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingTable ? 'Save Table' : 'Create Table'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Floor Table?"
        message="Are you sure you want to remove this table from the restaurant layout?"
        confirmText="Yes, Delete"
        isDanger={true}
      />
    </div>
  );
};

export default AdminTablesPage;
