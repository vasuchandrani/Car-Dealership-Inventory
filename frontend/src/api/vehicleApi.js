import apiClient from './apiClient';

export const vehicleApi = {
  getAllVehicles: async (page = 0, size = 20) => {
    const response = await apiClient.get('/vehicles', {
      params: { page, size, sort: 'id,desc' },
    });
    return response.data;
  },

  searchVehicles: async (filters, page = 0, size = 20) => {
    const response = await apiClient.get('/vehicles/search', {
      params: { ...filters, page, size, sort: 'id,desc' },
    });
    return response.data;
  },

  getVehicleById: async (id) => {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data;
  },

  createVehicle: async (formData) => {
    const response = await apiClient.post('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateVehicle: async (id, formData) => {
    const response = await apiClient.put(`/vehicles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await apiClient.delete(`/vehicles/${id}`);
    return response.data;
  },
};
