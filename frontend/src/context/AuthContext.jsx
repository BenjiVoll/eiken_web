import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

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

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Configurar el token para futuras peticiones
        authService.setAuthToken(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Importante: siempre terminar el loading
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Iniciando login...'); // Debug
      const response = await authService.login(email, password);
      
      console.log('Respuesta del login:', response); // Para debug
      console.log('response.data:', response.data); // Debug adicional
      
      // El backend devuelve: { status: "Success", message: "...", data: { token, user } }
      if (response.status === 'Success') {
        const { data } = response;
        console.log('Data extraída:', data); // Debug
        
        if (!data || !data.token || !data.user) {
          console.error('Estructura de datos incorrecta:', data);
          return { success: false, error: 'Estructura de respuesta inválida' };
        }
        
        const { token, user: userData } = data;
        
        console.log('Login exitoso, guardando datos...', userData); // Debug
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Configurar el token para futuras peticiones
        authService.setAuthToken(token);
        
        // Actualizar el estado
        setUser(userData);
        
        console.log('Usuario actualizado en contexto:', userData); // Debug
        
        return { success: true };
      } else {
        const errorMessage = response.message || 'Error de autenticación';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar el token de las peticiones
    authService.setAuthToken(null);
    
    // Limpiar el estado
    setUser(null);
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
