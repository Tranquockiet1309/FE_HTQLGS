import api from './api';

export const paymentService = {
  getByOrder: async (orderId) => {
    const response = await api.get(`/v1/payments/order/${orderId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/v1/payments', data);
    return response.data;
  },

  createVnPayUrl: async (data) => {
    const response = await api.post('/v1/payments/vnpay/create-url', data);
    return response.data;
  },

  vnPayCallback: async (queryString) => {
    const response = await api.get(`/v1/payments/vnpay/callback${queryString}`);
    return response.data;
  }
};
