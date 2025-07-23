import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { tokenManager } from '../services/apiService';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        tokenManager.setAuthToken(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Listener para logout automático cuando el token expira
    const handleAutoLogout = () => {
      setUser(null);
      // Solo redirigir a login si estamos en rutas protegidas
      if (window.location.pathname.startsWith('/intranet')) {
        window.location.href = '/login';
      }
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    
    // Importante: siempre terminar el loading
    setLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // El backend devuelve: { status: "Success", message: "...", data: { token, user } }
      if (response.status === 'Success') {
        const { data } = response;
        
        if (!data || !data.token || !data.user) {
          console.error('Estructura de datos incorrecta:', data);
          return { success: false, error: 'Estructura de respuesta inválida' };
        }
        
        const { token, user: userData } = data;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        tokenManager.setAuthToken(token);
        
        // Actualizar el estado
        setUser(userData);
        
        return { success: true };
      } else {
        const errorMessage = response.message || 'Error de autenticación';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error de conexión';
      
      if (error.response) {
        // El servidor respondió con un código de error
        errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        // Algo más pasó
        errorMessage = error.message || 'Error desconocido';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    setLoggingOut(true);
    
    // Limpiar localStorage primero
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar el token de las peticiones
    tokenManager.setAuthToken(null);
    
    // Limpiar el estado
    setUser(null);
    
    // NO hacer petición al backend para evitar 401
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.status === 'success') {
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error de conexión' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    loggingOut,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isDesigner: user?.role === 'designer' || user?.role === 'manager' || user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
