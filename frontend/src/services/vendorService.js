import apiRequest from './api';

const vendorService = {
  getAll: () => apiRequest('/api/vendors'),
  getById: (id) => apiRequest(`/api/vendors/${id}`),
  create: (data) => apiRequest('/api/vendors', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/api/vendors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/api/vendors/${id}`, {
    method: 'DELETE'
  })
};

export default vendorService;
