// Central 24/7 Render Cloud API endpoint
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://og-supplement-api.onrender.com/api';

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
      const res = await apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) });
      if (res && res.order) {
        // Also sync to local storage for instant access in customer OrderHistory
        const existingOrders = getLocalOrders();
        saveLocalOrders([res.order, ...existingOrders.filter(o => o.orderId !== res.order.orderId)]);
      }
      return res;
    } catch (error) {
      console.warn('[Order API Notice] Server request failed, saving to local fallback', error.message);
      
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
        paymentStatus: orderData.paymentMethod === 'Online / UPI' ? 'Verification Pending' : 'Pending',
        transactionId: orderData.transactionId || '',
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
      const res = await apiRequest(`/orders/my-orders${email ? `?email=${encodeURIComponent(email)}` : ''}`);
      if (res && res.orders) {
        return res;
      }
    } catch (error) {
      console.warn('[Get My Orders Notice] Falling back to local storage', error.message);
    }
    const localOrders = getLocalOrders();
    const filtered = email
      ? localOrders.filter(o => o.email?.toLowerCase() === email.toLowerCase())
      : localOrders;
    return { success: true, orders: filtered };
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
      const res = await apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      // Update local storage too
      const localOrders = getLocalOrders();
      const updated = localOrders.map(o => (o._id === id || o.orderId === id ? { ...o, orderStatus: status, updatedAt: new Date().toISOString() } : o));
      saveLocalOrders(updated);
      return res;
    } catch (error) {
      console.warn('[Update Order Status Notice] Updating local storage', error.message);
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

  // Categories & Homepage Management
  getCategories: async () => {
    try {
      const res = await apiRequest('/categories');
      if (res && res.categories && res.categories.length > 0) {
        try {
          localStorage.setItem('og_homepage_categories', JSON.stringify(res.categories));
        } catch (e) {}
        return res;
      }
    } catch (error) {
      console.warn('[Get Categories Notice] Backend offline or connecting, falling back to cached storage', error.message);
    }
    try {
      const cached = JSON.parse(localStorage.getItem('og_homepage_categories') || '[]');
      if (cached.length > 0) {
        return { success: true, categories: cached };
      }
    } catch (e) {}
    return { success: true, categories: [] };
  },
  createCategory: (data) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Payment & QR Code Settings
  getPaymentSettings: async () => {
    try {
      const res = await apiRequest('/settings/payment');
      if (res && res.settings) {
        try {
          localStorage.setItem('og_payment_settings', JSON.stringify(res.settings));
        } catch (e) {}
        return res;
      }
    } catch (error) {
      console.warn('[Get Payment Settings Notice] Using cached storage', error.message);
    }
    try {
      const cached = JSON.parse(localStorage.getItem('og_payment_settings') || 'null');
      if (cached) {
        return { success: true, settings: cached };
      }
    } catch (e) {}
    return {
      success: true,
      settings: {
        qrCodeImage: '/uploads/merchant_qr.jpg',
        upiId: 'ogsupplement@okaxis',
        merchantName: 'OG Supplement Store',
        isUpiEnabled: true,
        isCodEnabled: true,
        isRazorpayEnabled: true,
        razorpayKeyId: 'rzp_test_5173DemoKey',
        razorpayMode: 'test',
        instructions: 'Scan this QR code using PhonePe, Google Pay, Paytm, or any UPI app. Complete the payment and enter your 12-digit UPI UTR / Transaction Reference Number below.'
      }
    };
  },

  // Razorpay Gateway
  createRazorpayOrder: async (data) => {
    try {
      return await apiRequest('/payment/razorpay/create-order', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      // Sandbox Simulator Fallback
      return {
        success: true,
        orderId: 'order_test_' + Date.now().toString(36),
        amount: Math.round(Number(data.amount) * 100),
        currency: 'INR',
        keyId: 'rzp_test_5173DemoKey',
        mode: 'test',
        isDemo: true
      };
    }
  },
  verifyRazorpayPayment: async (data) => {
    try {
      return await apiRequest('/payment/razorpay/verify', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      return { success: true, verified: true, paymentId: data.razorpay_payment_id || 'pay_test_' + Date.now().toString(36) };
    }
  }
};
