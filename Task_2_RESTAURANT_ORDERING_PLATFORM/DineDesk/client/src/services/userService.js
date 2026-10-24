import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getCustomersWithStats: async () => {
    const res = await api.get('/users/customers');
    return res.data;
  },

  createStaffUser: async (staffData) => {
    const res = await api.post('/users/staff', staffData);
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};
