import { useState } from 'react';

/**
 * Custom hook para manejar formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} validationSchema - Función de validación opcional
 * @returns {Object} - Objeto con valores, errores y funciones del formulario
 */
export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validate = () => {
    if (!validationSchema) return true;
    
    const validationErrors = validationSchema(values);
    setErrors(validationErrors);
    
    return Object.keys(validationErrors).length === 0;
  };

  // Limpiar formulario
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  // Establecer valores específicos
  const setValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Establecer errores específicos
  const setError = (name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (onSubmit) => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    validate,
    reset,
    setValue,
    setError,
    setIsSubmitting
  };
};
