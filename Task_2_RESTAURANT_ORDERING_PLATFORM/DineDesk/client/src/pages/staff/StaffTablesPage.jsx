import { Grid, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TableCard from '../../components/tables/TableCard';
import { useToast } from '../../context/ToastContext';
import { tableService } from '../../services/tableService';

const StaffTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const toast = useToast();

  const fetchTables = async () => {
    setLoading(true);
    try {
      const data = await tableService.getTables({
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
      });
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [selectedLocation]);

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await tableService.updateTableStatus(tableId, newStatus);
      toast.success(`Table status changed to ${newStatus}`);
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to update table status');
    }
  };

  const locations = ['all', 'Indoor', 'Patio', 'Rooftop', 'VIP'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Floor Table Management</h1>
          <p className="text-xs text-slate-500">Monitor table capacity, seating, and cleaning turnover</p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchTables} icon={RefreshCw}>
          Refresh Floor
        </Button>
      </div>

      {/* Location Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {locations.map((loc) => (
          <button
            key={loc}
            onClick={() => setSelectedLocation(loc)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedLocation === loc
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {loc === 'all' ? 'All Dining Sections' : `${loc} Dining`}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      {loading ? (
        <LoadingSpinner text="Loading floor layout..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onStatusChange={handleStatusChange}
              canManage={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffTablesPage;
