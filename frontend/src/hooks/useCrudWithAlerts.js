import { useState } from 'react';
import { SweetAlertHelper, CrudAlerts } from '../helpers';

/**
 * Custom hook para operaciones CRUD con SweetAlert
 * @param {Object} apiMethods - Métodos de la API (create, update, delete, etc.)
 * @param {string} entityType - Tipo de entidad (services, quotes, users)
 * @returns {Object} - Funciones CRUD con alertas
 */
export const useCrudWithAlerts = (apiMethods, entityType = 'services') => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const alerts = CrudAlerts[entityType];

  /**
   * Crear nuevo elemento con confirmación
   * @param {Object} data - Datos del elemento
   * @returns {Promise<Object|null>} - Elemento creado o null si se cancela
   */
  const createWithConfirm = async (data) => {
    try {
      const confirmed = await alerts.confirmCreate();
      if (!confirmed) return null;

      setLoading(true);
      SweetAlertHelper.loading('Creando...');

      const result = await apiMethods.create(data);
      
      SweetAlertHelper.close();
      alerts.successCreate();
      
      // Actualizar lista local
      setItems(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      SweetAlertHelper.close();
      alerts.errorCreate(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar elemento con confirmación
   * @param {number|string} id - ID del elemento
   * @param {Object} data - Datos actualizados
   * @param {string} itemName - Nombre del elemento
   * @returns {Promise<Object|null>} - Elemento actualizado o null si se cancela
   */
  const updateWithConfirm = async (id, data, itemName = '') => {
    try {
      const confirmed = await alerts.confirmUpdate(itemName);
      if (!confirmed) return null;

      setLoading(true);
      SweetAlertHelper.loading('Actualizando...');

      const result = await apiMethods.update(id, data);
      
      SweetAlertHelper.close();
      alerts.successUpdate();
      
      // Actualizar lista local
      setItems(prev => prev.map(item => item.id === id ? result : item));
      
      return result;
    } catch (error) {
      SweetAlertHelper.close();
      alerts.errorUpdate(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar elemento con confirmación
   * @param {number|string} id - ID del elemento
   * @param {string} itemName - Nombre del elemento
   * @returns {Promise<boolean>} - true si se eliminó, false si se canceló
   */
  const deleteWithConfirm = async (id, itemName = '') => {
    try {
      const confirmed = await alerts.confirmDelete(itemName);
      if (!confirmed) return false;

      setLoading(true);
      SweetAlertHelper.loading('Eliminando...');

      await apiMethods.delete(id);
      
      SweetAlertHelper.close();
      alerts.successDelete();
      
      // Actualizar lista local
      setItems(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (error) {
      SweetAlertHelper.close();
      alerts.errorDelete(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener todos los elementos
   * @returns {Promise<Array>} - Lista de elementos
   */
  const fetchAll = async () => {
    try {
      setLoading(true);
      const result = await apiMethods.getAll();
      setItems(result);
      return result;
    } catch (error) {
      SweetAlertHelper.error(`Error al cargar ${entityType}: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear elemento sin confirmación (útil para formularios que ya tienen su propia confirmación)
   * @param {Object} data - Datos del elemento
   * @returns {Promise<Object>} - Elemento creado
   */
  const createSilent = async (data) => {
    try {
      setLoading(true);
      const result = await apiMethods.create(data);
      setItems(prev => [...prev, result]);
      return result;
    } catch (error) {
      alerts.errorCreate(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar elemento sin confirmación
   * @param {number|string} id - ID del elemento
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Elemento actualizado
   */
  const updateSilent = async (id, data) => {
    try {
      setLoading(true);
      const result = await apiMethods.update(id, data);
      setItems(prev => prev.map(item => item.id === id ? result : item));
      return result;
    } catch (error) {
      alerts.errorUpdate(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mostrar toast de éxito personalizado
   * @param {string} message - Mensaje personalizado
   */
  const showSuccess = (message) => {
    SweetAlertHelper.toast(message, 'success');
  };

  /**
   * Mostrar toast de error personalizado
   * @param {string} message - Mensaje de error
   */
  const showError = (message) => {
    SweetAlertHelper.toast(message, 'error');
  };

  return {
    // Estado
    loading,
    items,
    setItems,
    
    // Operaciones con confirmación
    createWithConfirm,
    updateWithConfirm,
    deleteWithConfirm,
    
    // Operaciones silenciosas
    createSilent,
    updateSilent,
    
    // Utilidades
    fetchAll,
    showSuccess,
    showError,
    
    // Acceso directo a SweetAlert
    alerts: SweetAlertHelper
  };
};
