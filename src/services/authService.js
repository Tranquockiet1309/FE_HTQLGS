import api from './api';

export const authService = {
  login: async (credentials) => {
    // Backend expects: { usernameOrPhone, password }
    const response = await api.post('/v1/auth/login', {
      usernameOrPhone: credentials.usernameOrPhone,
      password: credentials.password,
    });
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  register: async (userData) => {
    try {
      console.log("CALL REGISTER API");

      const response = await api.post('/v1/auth/register', userData);

      console.log("RESPONSE", response);
      return response.data;

    } catch (err) {
      console.log("REGISTER ERROR FULL:", err);
      console.log("MESSAGE:", err.message);
      console.log("RESPONSE:", err.response);
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = "/login";
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }
    const response = await api.get('/v1/auth/me');
    return response.data;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};
