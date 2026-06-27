import apiRequest from './api';

const stockService = {
  // Stock Levels
  getAllStock: () => apiRequest('/api/stock'),
  addStockEntry: (data) => apiRequest('/api/stock/entry', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAlerts: () => apiRequest('/api/stock/alerts'),
  getHistory: () => apiRequest('/api/stock/history'),

  // Dispatches
  getAllDispatches: () => apiRequest('/api/dispatches'),
  createDispatch: (data) => apiRequest('/api/dispatches', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDispatchStatus: (id, status) => apiRequest(`/api/dispatches/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),

  // Returns
  getAllReturns: () => apiRequest('/api/returns'),
  createReturn: (data) => apiRequest('/api/returns', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateReturn: (id, data) => apiRequest(`/api/returns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Damaged Goods
  getAllDamage: () => apiRequest('/api/damaged'),
  createDamage: (data) => apiRequest('/api/damaged', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDamage: (id, data) => apiRequest(`/api/damaged/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateDamageStatus: (id, status, action_taken) => apiRequest(`/api/damaged/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, action_taken })
  })
};

export default stockService;
