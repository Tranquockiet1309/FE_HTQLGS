import api from './api';

export const usersService = {
  getAll: async () => {
    const response = await api.get('/v1/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/v1/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/v1/users', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/v1/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/v1/users/${id}`);
    return response.data;
  },
  
  getByRole: async (role) => {
    const response = await api.get(`/v1/users/role/${role}`);
    return response.data;
  }
};
