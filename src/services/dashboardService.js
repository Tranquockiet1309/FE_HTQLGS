import api from './api';

export const dashboardService = {
  getStats: async (startDate, endDate) => {
    let url = '/v1/dashboard/stats';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  getMonthlySummary: async (months = 5) => {
    const response = await api.get(`/v1/dashboard/monthly-summary?months=${months}`);
    return response.data;
  }
};
