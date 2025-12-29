import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Emitir un evento personalizado para que el AuthContext maneje la redirección
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const tokenManager = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const activitiesAPI = {
  getRecent: async (limit = 10) => {
    const response = await api.get(`/activities?limit=${limit}`);
    return response.data;
  }
};

export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  getActive: () => api.get('/public/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, formData) => api.post(`/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (id) => api.delete(`/products/${id}/image`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getByEmail: (email) => api.get(`/orders/email/${email}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const publicAPI = {
  services: {
    getActive: async () => {
      const response = await publicApi.get('/public/services/active');
      return response.data;
    },

    getAll: async () => {
      const response = await publicApi.get('/public/services');
      return response.data;
    },

    getById: async (id) => {
      const response = await publicApi.get(`/public/services/${id}`);
      return response.data;
    },

    getByDivision: async (division) => {
      const response = await publicApi.get(`/public/services/division/${division}`);
      return response.data;
    },

    getByCategory: async (category) => {
      const response = await publicApi.get(`/public/services/category/${category}`);
      return response.data;
    },

    getCategories: async () => {
      const response = await publicApi.get('/public/services/categories');
      return response.data.data;
    }
  },

  quotes: {
    create: async (quoteData) => {
      const response = await publicApi.post('/quotes/public', quoteData);
      return response.data;
    },
    uploadImages: async (id, formData) => {
      const response = await publicApi.post(`/quotes/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  },

  projects: {
    getAll: async () => {
      const response = await publicApi.get('/public/projects');
      return response.data;
    },

    getByStatus: async (status) => {
      const response = await publicApi.get(`/public/projects/status/${status}`);
      return response.data;
    }
  }
};

export const servicesAPI = {
  // Obtener todos los servicios
  getAll: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  // Obtener servicio por ID
  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Crear nuevo servicio
  create: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // Actualizar servicio
  update: async (id, serviceData) => {
    const response = await api.patch(`/services/${id}`, serviceData);
    return response.data;
  },

  // Eliminar servicio
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  }
};

export const inventoryAPI = {
  getAll: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};



export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.patch(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  uploadImage: async (id, formData) => {
    const response = await api.post(`/projects/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export const quotesAPI = {
  getAll: async () => {
    const response = await api.get('/quotes');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  create: async (quoteData) => {
    const response = await api.post('/quotes', quoteData);
    return response.data;
  },

  update: async (id, quoteData) => {
    const response = await api.patch(`/quotes/${id}`, quoteData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/quotes/${id}`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },

  convert: async (id) => {
    const response = await api.post(`/quotes/${id}/convert`);
    return response.data;
  },

  reply: async (id, data) => {
    const response = await api.post(`/quotes/${id}/reply`, data);
    return response.data;
  }
};

export const clientsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  update: async (id, clientData) => {
    const response = await api.patch(`/clients/${id}`, clientData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};

export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const divisionsAPI = {
  getAll: async () => {
    const response = await api.get('/divisions');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/divisions/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/divisions', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/divisions/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/divisions/${id}`);
    return response.data;
  },
};
