import api from './api';

export const dashboardService = {
  getAdminDashboard: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },

  getStaffDashboard: async () => {
    const res = await api.get('/dashboard/staff');
    return res.data;
  },

  getKitchenDashboard: async () => {
    const res = await api.get('/dashboard/kitchen');
    return res.data;
  },

  getCustomerDashboard: async () => {
    const res = await api.get('/dashboard/customer');
    return res.data;
  },
};
