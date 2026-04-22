import api from './api';

export const orderService = {
  getAll: async () => {
    const response = await api.get('/v1/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/v1/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/v1/orders', orderData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/v1/orders/${id}/status?status=${status}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/v1/orders/${id}`);
    return response.data;
  }
};
