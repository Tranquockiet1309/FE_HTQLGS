import api from './api';

// ServicesController => /api/v1/services (for laundry service types)
// InventoryController => /api/v1/inventory (for inventory transactions)
export const productService = {
  // Laundry services (wash, dry, iron, etc.)
  getAll: async (onlyActive = false) => {
    const response = await api.get(`/v1/services?onlyActive=${onlyActive}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/v1/services/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/v1/services', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/v1/services/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/v1/services/${id}`);
    return response.data;
  },

  // Inventory transactions
  getInventory: async () => {
    const response = await api.get('/v1/inventory');
    return response.data;
  },

  createInventoryTxn: async (data) => {
    const response = await api.post('/v1/inventory', data);
    return response.data;
  }
};
