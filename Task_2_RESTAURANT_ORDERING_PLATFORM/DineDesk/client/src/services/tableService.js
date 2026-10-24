import api from './api';

export const tableService = {
  getTables: async (params = {}) => {
    const res = await api.get('/tables', { params });
    return res.data;
  },

  getTableById: async (id) => {
    const res = await api.get(`/tables/${id}`);
    return res.data;
  },

  createTable: async (tableData) => {
    const res = await api.post('/tables', tableData);
    return res.data;
  },

  updateTable: async (id, tableData) => {
    const res = await api.put(`/tables/${id}`, tableData);
    return res.data;
  },

  updateTableStatus: async (id, status) => {
    const res = await api.patch(`/tables/${id}/status`, { status });
    return res.data;
  },

  deleteTable: async (id) => {
    const res = await api.delete(`/tables/${id}`);
    return res.data;
  },
};
