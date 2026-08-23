// Central 24/7 Render Cloud API endpoint
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://og-supplement-api.onrender.com/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('og_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (e.g. file upload)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('BACKEND_OFFLINE');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Network request failed');
  }

  return data;
};

export const api = {
  // Admin Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/auth/me'),

  // Products CRUD
  getProducts: (params = '') => apiRequest(`/products${params}`),
  getProductById: (id) => apiRequest(`/products/${id}`),
  createProduct: (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStock: (id, stockData) => apiRequest(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify(stockData) }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Orders Management
  getAllOrders: () => apiRequest('/orders'),
  getOrderById: (id) => apiRequest(`/orders/${id}`),
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Analytics & Stats
  getAdminStats: () => apiRequest('/admin/stats'),
  uploadImage: (formData) => apiRequest('/admin/upload', { method: 'POST', body: formData }),
};
