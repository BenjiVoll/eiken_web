import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

  create: async (inventoryData) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },

  update: async (id, inventoryData) => {
    const response = await api.patch(`/inventory/${id}`, inventoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};

export const suppliersAPI = {
  getAll: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  update: async (id, supplierData) => {
    const response = await api.patch(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
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

  delete: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
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
