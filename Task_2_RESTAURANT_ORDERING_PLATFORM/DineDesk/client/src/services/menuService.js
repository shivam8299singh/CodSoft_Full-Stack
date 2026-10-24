import api from './api';

export const menuService = {
  getMenuItems: async (params = {}) => {
    const res = await api.get('/menu', { params });
    return res.data;
  },

  getMenuItemById: async (id) => {
    const res = await api.get(`/menu/${id}`);
    return res.data;
  },

  createMenuItem: async (itemData) => {
    const res = await api.post('/menu', itemData);
    return res.data;
  },

  updateMenuItem: async (id, itemData) => {
    const res = await api.put(`/menu/${id}`, itemData);
    return res.data;
  },

  toggleAvailability: async (id) => {
    const res = await api.patch(`/menu/${id}/availability`);
    return res.data;
  },

  deleteMenuItem: async (id) => {
    const res = await api.delete(`/menu/${id}`);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await api.post('/categories', categoryData);
    return res.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await api.put(`/categories/${id}`, categoryData);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};
