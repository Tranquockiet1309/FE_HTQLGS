import api from './api';

// DeliveryController uses [Route("api/[controller]")] => /api/Delivery (case-insensitive: /api/delivery)
export const deliveryService = {
  getAssignedOrders: async (shipperId) => {
    const response = await api.get(`/delivery/assigned-orders/${shipperId}`);
    return response.data;
  },

  uploadProof: async (orderId, shipperId, imageFile) => {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('shipperId', shipperId);
    formData.append('image', imageFile);

    const response = await api.post('/delivery/upload-proof', formData);
    return response.data;
  },

  getShippers: async () => {
    const response = await api.get('/delivery/shippers');
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/delivery/my-orders');
    return response.data;
  },

  assignShipper: async (orderId, shipperId) => {
    const response = await api.post('/delivery/assign-shipper', {
      orderId,
      shipperId
    });
    return response.data;
  },

  linkUser: async (shipperId, userId) => {
    const response = await api.post(`/delivery/shippers/${shipperId}/link-user/${userId}`);
    return response.data;
  },

  confirmArrival: async (orderId) => {
    const response = await api.post(`/delivery/${orderId}/confirm-arrival`);
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/delivery/my-history');
    return response.data;
  }
};
