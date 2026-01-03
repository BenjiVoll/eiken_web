import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Shield,
  Save,
  CheckCircle
} from 'lucide-react';

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'designer', label: 'Diseñador' },
  { value: 'operator', label: 'Operador' }
];

const UserModal = ({ isOpen, onClose, onSave, user = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Nunca mostrar la contraseña actual
        role: user.role || 'operator',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'operator',
        isActive: true
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email no válido';

    // Validación de contraseña
    if (!user && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length > 0) {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/;
      if (formData.password.length < 8) {
        newErrors.password = 'Mínimo 8 caracteres';
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Debe contener al menos letras y números';
      }
    }

    if (!formData.role) newErrors.role = 'El rol es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (!submitData.password) delete submitData.password; // No enviar password vacío
      onSave(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <p className="mt-1 text-blue-100 text-sm opacity-90">
                  {user
                    ? 'Actualiza los permisos y datos de acceso.'
                    : 'Registra un nuevo miembro del equipo.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                    placeholder="ejemplo@empresa.com"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rol de Usuario *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer ${errors.role ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                    required
                  >
                    {roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña {user ? '(Opcional)' : '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                    autoComplete="new-password"
                    placeholder={user ? 'Dejar en blanco para mantener actual' : 'Mínimo 8 caracteres'}
                    minLength={user ? 0 : 8}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Debe contener letras y números (ej: admin2025)
                </p>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Estado */}
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <label className="flex items-center space-x-3 cursor-pointer w-full">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-semibold text-gray-900">
                      Usuario Activo
                    </span>
                    <span className="block text-xs text-gray-500">
                      Permitir acceso al sistema
                    </span>
                  </div>
                </label>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <Save className="h-5 w-5" />
                <span>{user ? 'Guardar Cambios' : 'Crear Usuario'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
