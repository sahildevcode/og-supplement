const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return window.location.port === '5173' ? '/api' : 'http://localhost:5000/api';
  }
  return 'https://og-supplement-api.onrender.com/api';
};

const BASE_URL = getApiBaseUrl();

// Helper for local offline orders fallback
const getLocalOrders = () => {
  try {
    return JSON.parse(localStorage.getItem('og_supplement_orders') || '[]');
  } catch (e) {
    return [];
  }
};

const saveLocalOrders = (orders) => {
  try {
    localStorage.setItem('og_supplement_orders', JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save local orders', e);
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('og_token') || localStorage.getItem('apex_token');
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

  // Orders with resilient cloud + offline fallback
  createOrder: async (orderData) => {
    try {
      return await apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) });
    } catch (error) {
      console.warn('[Order API Notice] Using resilient local storage fallback for order placement');
      
      const subtotal = orderData.products.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
      const discount = subtotal > 2000 ? Math.round(subtotal * 0.05) : 0;
      const shipping = subtotal >= 999 ? 0 : 99;
      const totalAmount = subtotal - discount + shipping;

      const localOrder = {
        _id: 'ord_' + Math.random().toString(36).substring(2, 12),
        orderId: 'SUPP-' + Math.floor(100000 + Math.random() * 900000),
        userId: orderData.userId || 'guest',
        customerName: orderData.customerName,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        pincode: orderData.pincode,
        landmark: orderData.landmark || '',
        products: orderData.products,
        subtotal,
        discount,
        shipping,
        totalAmount,
        paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
        paymentStatus: orderData.paymentMethod === 'Online / UPI' ? 'Paid' : 'Pending',
        orderStatus: 'Order Placed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingOrders = getLocalOrders();
      saveLocalOrders([localOrder, ...existingOrders]);

      return {
        success: true,
        order: localOrder,
        message: 'Order placed successfully!'
      };
    }
  },

  getMyOrders: async (email) => {
    try {
      return await apiRequest(`/orders/my-orders${email ? `?email=${encodeURIComponent(email)}` : ''}`);
    } catch (error) {
      const localOrders = getLocalOrders();
      const filtered = email
        ? localOrders.filter(o => o.email?.toLowerCase() === email.toLowerCase())
        : localOrders;
      return { success: true, orders: filtered };
    }
  },

  getAllOrders: async () => {
    try {
      return await apiRequest('/orders');
    } catch (error) {
      const localOrders = getLocalOrders();
      return { success: true, count: localOrders.length, orders: localOrders };
    }
  },

  getOrderById: async (id) => {
    try {
      return await apiRequest(`/orders/${id}`);
    } catch (error) {
      const localOrders = getLocalOrders();
      const order = localOrders.find(o => o._id === id || o.orderId === id);
      if (order) return { success: true, order };
      throw new Error('Order not found');
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      return await apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    } catch (error) {
      const localOrders = getLocalOrders();
      const updated = localOrders.map(o => (o._id === id || o.orderId === id ? { ...o, orderStatus: status, updatedAt: new Date().toISOString() } : o));
      saveLocalOrders(updated);
      const found = updated.find(o => o._id === id || o.orderId === id);
      return { success: true, order: found, message: `Order status updated to ${status}` };
    }
  },

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  uploadImage: (formData) => apiRequest('/admin/upload', { method: 'POST', body: formData }),
};
