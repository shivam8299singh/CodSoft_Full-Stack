import api from './api';

export const reservationService = {
  createReservation: async (reservationData) => {
    const res = await api.post('/reservations', reservationData);
    return res.data;
  },

  getReservations: async (params = {}) => {
    const res = await api.get('/reservations', { params });
    return res.data;
  },

  getMyReservations: async () => {
    const res = await api.get('/reservations/my');
    return res.data;
  },

  getReservationById: async (id) => {
    const res = await api.get(`/reservations/${id}`);
    return res.data;
  },

  updateReservationStatus: async (id, status, tableId) => {
    const res = await api.patch(`/reservations/${id}/status`, { status, tableId });
    return res.data;
  },

  cancelMyReservation: async (id) => {
    const res = await api.patch(`/reservations/${id}/cancel`);
    return res.data;
  },
};
