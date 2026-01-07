import { useState, useEffect, useCallback } from 'react';

// Custom hook para manejar llamadas a la API

export const useApi = (apiFunction, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error en la API');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

//Hook para manejar operaciones CRUD
export const useCrud = (apiMethods) => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los items
  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiMethods.getAll();
      setItems(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error al obtener datos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un item por ID
  const fetchById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiMethods.getById(id);
      setCurrentItem(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error al obtener el item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo item
  const create = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiMethods.create(data);
      setItems(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message || 'Error al crear el item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar item
  const update = async (id, data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiMethods.update(id, data);
      setItems(prev => prev.map(item => item.id === id ? result : item));
      if (currentItem && currentItem.id === id) {
        setCurrentItem(result);
      }
      return result;
    } catch (err) {
      setError(err.message || 'Error al actualizar el item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar item
  const remove = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await apiMethods.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      if (currentItem && currentItem.id === id) {
        setCurrentItem(null);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Error al eliminar el item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    currentItem,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    setCurrentItem,
    setError
  };
};
