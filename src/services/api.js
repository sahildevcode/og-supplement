const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('apex_token');
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Network request failed');
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/auth/me'),

  // Products
  getProducts: (params = '') => apiRequest(`/products${params}`),
  getProductById: (id) => apiRequest(`/products/${id}`),
  createProduct: (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStock: (id, stockData) => apiRequest(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify(stockData) }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (orderData) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getMyOrders: (email) => apiRequest(`/orders/my-orders${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  getAllOrders: () => apiRequest('/orders'),
  getOrderById: (id) => apiRequest(`/orders/${id}`),
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  uploadImage: (formData) => apiRequest('/admin/upload', { method: 'POST', body: formData }),
};
