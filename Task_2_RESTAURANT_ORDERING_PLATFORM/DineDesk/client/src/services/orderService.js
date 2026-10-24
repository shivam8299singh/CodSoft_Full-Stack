import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  getOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get('/orders/my');
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  trackOrder: async (orderNumber) => {
    const res = await api.get(`/orders/track/${orderNumber}`);
    return res.data;
  },

  updateOrderStatus: async (id, status) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  },

  // Payments
  processPayment: async (paymentData) => {
    const res = await api.post('/payments/process', paymentData);
    return res.data;
  },

  getAllPayments: async (params = {}) => {
    const res = await api.get('/payments', { params });
    return res.data;
  },
};
