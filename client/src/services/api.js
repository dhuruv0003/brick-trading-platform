import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('brickpro_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        localStorage.removeItem('brickpro_token');
        localStorage.removeItem('brickpro_user');
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
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
};

// AI
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  recommend: (data) => api.post('/ai/recommend', data),
  generateBlog: (data) => api.post('/admin/ai/generate-blog', data),
  replySuggestion: (data) => api.post('/admin/ai/reply-suggestion', data),
  insights: () => api.get('/admin/ai/insights'),
};

export default api;
