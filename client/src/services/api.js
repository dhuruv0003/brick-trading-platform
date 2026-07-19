import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

if (typeof window !== 'undefined') {
  const runningOnLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (API_BASE.includes('localhost') && !runningOnLocalhost) {
    // This means NEXT_PUBLIC_API_URL was never set in the deployment
    // platform's environment variables (or was set after the last build —
    // NEXT_PUBLIC_ vars are baked in at build time, so changing them
    // requires a redeploy). Every API call from this session will fail as
    // a network error until that's fixed.
    // eslint-disable-next-line no-console
    console.error(
      '[BrickPro] NEXT_PUBLIC_API_URL is not set for this deployment — the app is trying to ' +
      `reach ${API_BASE} from a browser on ${window.location.hostname}, which will always fail. ` +
      'Set NEXT_PUBLIC_API_URL to your deployed backend URL in your hosting platform\'s environment ' +
      'variables and redeploy.',
    );
  }
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extracts a human-readable message from any Axios error, distinguishing
 * "server responded with an error" from "request never reached the server"
 * (network failure / CORS / wrong API URL / backend down) — the two most
 * common deployment-time failure modes, which otherwise both look identical
 * to the end user as a generic "failed" toast.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.isAxiosError) return fallback;

  if (error.response) {
    // Server responded, but with an error status.
    return error.response.data?.message || fallback;
  }

  if (error.request) {
    // Request was sent but no response came back — network/CORS/DNS/server-down.
    // eslint-disable-next-line no-console
    console.error('[BrickPro] API request failed with no response (network/CORS/server down):', {
      url: error.config?.baseURL + error.config?.url,
      message: error.message,
    });
    return 'Could not reach the server. Please check your internet connection and try again in a moment.';
  }

  return error.message || fallback;
}

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      if (config.url && config.url.startsWith('/customer')) {
        const token = localStorage.getItem('brickpro_customer_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } else {
        const token = localStorage.getItem('brickpro_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        if (error.config?.url && error.config.url.startsWith('/customer')) {
          localStorage.removeItem('brickpro_customer_token');
          localStorage.removeItem('brickpro_customer');
          sessionStorage.removeItem('brickpro_customer_token');
          sessionStorage.removeItem('brickpro_customer');
          if (window.location.pathname.startsWith('/account') || window.location.pathname.startsWith('/checkout')) {
            window.location.href = '/auth/login?error=session_expired';
          }
        } else {
          localStorage.removeItem('brickpro_token');
          localStorage.removeItem('brickpro_user');
          sessionStorage.removeItem('brickpro_token');
          sessionStorage.removeItem('brickpro_user');
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login?error=session_expired';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── API Service functions ────────────────────────────────────────────────────

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.patch('/auth/update-password', data),
  updateProfile: (data) => api.patch('/auth/update-profile', data),
};

// Products
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (slug) => api.get(`/products/${slug}`),
  adminGetAll: (params) => api.get('/admin/products', { params }),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.patch(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  adminGetAll: (params) => api.get('/admin/categories', { params }),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.patch(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

// Blog
export const blogAPI = {
  getAll: (params) => api.get('/blog', { params }),
  getOne: (slug) => api.get(`/blog/${slug}`),
  getCategories: () => api.get('/blog/categories'),
  adminGetAll: (params) => api.get('/admin/blog', { params }),
  adminGetOne: (id) => api.get(`/admin/blog/${id}`),
  create: (data) => api.post('/admin/blog', data),
  update: (id, data) => api.patch(`/admin/blog/${id}`, data),
  delete: (id) => api.delete(`/admin/blog/${id}`),
};

// Projects
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (slug) => api.get(`/projects/${slug}`),
  adminGetAll: (params) => api.get('/admin/projects', { params }),
  create: (data) => api.post('/admin/projects', data),
  update: (id, data) => api.patch(`/admin/projects/${id}`, data),
  delete: (id) => api.delete(`/admin/projects/${id}`),
};

// Gallery
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  adminGetAll: (params) => api.get('/admin/gallery', { params }),
  create: (data) => api.post('/admin/gallery', data),
  update: (id, data) => api.patch(`/admin/gallery/${id}`, data),
  delete: (id) => api.delete(`/admin/gallery/${id}`),
};

// Testimonials
export const testimonialsAPI = {
  getAll: (params) => api.get('/testimonials', { params }),
  adminGetAll: (params) => api.get('/admin/testimonials', { params }),
  create: (data) => api.post('/admin/testimonials', data),
  update: (id, data) => api.patch(`/admin/testimonials/${id}`, data),
  delete: (id) => api.delete(`/admin/testimonials/${id}`),
};

// FAQs
export const faqsAPI = {
  getAll: (params) => api.get('/faqs', { params }),
  adminGetAll: (params) => api.get('/admin/faqs', { params }),
  create: (data) => api.post('/admin/faqs', data),
  update: (id, data) => api.patch(`/admin/faqs/${id}`, data),
  delete: (id) => api.delete(`/admin/faqs/${id}`),
};

// Inquiries & Quotes
export const inquiriesAPI = {
  submit: (data) => api.post('/inquiries', data),
  getAll: (params) => api.get('/admin/leads', { params }),
  updateStatus: (id, data) => api.patch(`/admin/leads/${id}/status`, data),
};

export const quotesAPI = {
  submit: (data) => api.post('/quotes', data),
  getAll: (params) => api.get('/admin/quotes', { params }),
  update: (id, data) => api.patch(`/admin/quotes/${id}`, data),
};

// Settings
export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/admin/settings'),
  upsert: (data) => api.post('/admin/settings', data),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.patch(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
};

// Upload
export const uploadAPI = {
  single: (formData) => api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  multiple: (formData) => api.post('/admin/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (publicId) => api.delete('/admin/upload', { data: { publicId } }),
};

// Reviews (public fetch + authenticated customer CRUD)
export const reviewsAPI = {
  getForProduct: (slug, params) => api.get(`/products/${slug}/reviews`, { params }),
  getMy: () => api.get('/customer/reviews/my'),
  create: (data) => api.post('/customer/reviews', data),
  update: (id, data) => api.patch(`/customer/reviews/${id}`, data),
  delete: (id) => api.delete(`/customer/reviews/${id}`),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/customer/notifications'),
  markRead: (id) => api.patch(`/customer/notifications/${id}/read`),
  markAllRead: () => api.patch('/customer/notifications/read-all'),
  delete: (id) => api.delete(`/customer/notifications/${id}`),
};

// AI
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  recommend: (data) => api.post('/ai/recommend', data),
  generateBlog: (data) => api.post('/admin/ai/generate-blog', data),
  replySuggestion: (data) => api.post('/admin/ai/reply-suggestion', data),
  insights: () => api.get('/admin/ai/insights'),
};

// Customer Auth
export const customerAuthAPI = {
  register: (data) => api.post('/customer/auth/register', data),
  login: (data) => api.post('/customer/auth/login', data),
  logout: () => api.post('/customer/auth/logout'),
  getMe: () => api.get('/customer/auth/me'),
  updatePassword: (data) => api.patch('/customer/auth/update-password', data),
  updateProfile: (data) => api.patch('/customer/auth/update-profile', data),
  forgotPassword: (data) => api.post('/customer/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/customer/auth/reset-password/${token}`, data),
};

// Customer Orders
export const ordersAPI = {
  getAll: (params) => api.get('/customer/orders', { params }),
  getOne: (id) => api.get(`/customer/orders/${id}`),
  create: (data) => api.post('/customer/orders', data),
  cancel: (id, data) => api.patch(`/customer/orders/${id}/cancel`, data),
};

// Customer Wishlist
export const wishlistAPI = {
  get: () => api.get('/customer/wishlist'),
  add: (data) => api.post('/customer/wishlist', data),
  remove: (productId) => api.delete(`/customer/wishlist/${productId}`),
};

// Customer Addresses
export const customerAddressAPI = {
  getAll: () => api.get('/customer/addresses'),
  create: (data) => api.post('/customer/addresses', data),
  update: (id, data) => api.patch(`/customer/addresses/${id}`, data),
  delete: (id) => api.delete(`/customer/addresses/${id}`),
  setDefault: (id) => api.patch(`/customer/addresses/${id}/set-default`),
};

// Admin Orders
export const adminOrdersAPI = {
  getAll: (params) => api.get('/admin/orders', { params }),
  getOne: (id) => api.get(`/admin/orders/${id}`),
  update: (id, data) => api.patch(`/admin/orders/${id}`, data),
};

// Admin Customers
export const adminCustomersAPI = {
  getAll: (params) => api.get('/admin/customers', { params }),
  getOne: (id) => api.get(`/admin/customers/${id}`),
  update: (id, data) => api.patch(`/admin/customers/${id}`, data),
};

export default api;
