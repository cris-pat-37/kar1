import apiRequest from './api';

const productService = {
  getAll: () => apiRequest('/api/products'),
  getById: (id) => apiRequest(`/api/products/${id}`),
  create: (data) => apiRequest('/api/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/api/products/${id}`, {
    method: 'DELETE'
  })
};

export default productService;
