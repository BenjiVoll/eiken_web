import React from 'react';
import ServiceInfoAlert from '../alerts/ServiceInfoAlert';
import { X } from 'lucide-react';

const QuoteModal = ({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  services,
  categories
}) => {
  // Si el modal se abre con un servicio preseleccionado, no se puede cambiar ni la categoría ni el servicio
  // Solo bloquear la categoría si hay un servicio seleccionado
  const categoriaBloqueada = !!formData.service;
  const [errors, setErrors] = React.useState({});
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {formData.service ?
              `Cotizar: ${Array.isArray(services) ? services.find(s => s.id === formData.service)?.name || 'Servicio' : 'Servicio'}` :
              'Solicitar Cotización'
            }
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={e => {
          e.preventDefault();
          const newErrors = {};
          if (!formData.clientName || !formData.clientName.trim()) {
            newErrors.clientName = 'Por favor ingresa tu nombre.';
          } else {
            const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
            if (!nameRegex.test(formData.clientName.trim())) {
              newErrors.clientName = 'El nombre solo debe contener letras y espacios.';
            }
          }
          if (!formData.clientEmail || !formData.clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
            newErrors.clientEmail = 'Por favor ingresa un email válido.';
          }
          if (!formData.clientPhone || !formData.clientPhone.trim()) {
            newErrors.clientPhone = 'Por favor ingresa tu teléfono.';
          } else {
            // Validar formato chileno: +56 seguido de 9 números, sin espacios
            const phone = formData.clientPhone.trim();
            const regex = /^\+56\d{9}$/;
            if (!regex.test(phone)) {
              newErrors.clientPhone = 'El formato debe ser +56 seguido de 9 números (ej: +56912345678).';
            }
          }
          if (!formData.categoryId) {
            newErrors.categoryId = 'Por favor selecciona una categoría.';
          }
          if (!formData.description || !formData.description.trim()) {
            newErrors.description = 'Por favor describe tu proyecto.';
          }
          setErrors(newErrors);
          if (Object.keys(newErrors).length > 0) return;
          onSubmit(e);
        }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información del Cliente */}
            <div className="md:col-span-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio del Catálogo
                </label>
                <select
                  value={formData.service || ''}
                  onChange={e => {
                    const selectedId = e.target.value;
                    const selectedService = services.find(s => String(s.id) === String(selectedId));
                    let newCategoryId = '';
                    if (selectedService) {
                      if (typeof selectedService.category === 'object' && selectedService.category !== null) {
                        newCategoryId = selectedService.category.id;
                      } else if (typeof selectedService.category === 'number' || typeof selectedService.category === 'string') {
                        newCategoryId = selectedService.category;
                      }
                    }
                    setFormData({
                      ...formData,
                      service: selectedId,
                      categoryId: newCategoryId,
                      customServiceTitle: ''
                    });
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                  disabled={services.length === 0}
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <h4 className="text-md font-semibold text-gray-800 mb-2">Tus Datos</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu Nombre *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e => {
                  setFormData({ ...formData, clientName: e.target.value });
                  if (errors.clientName) setErrors(prev => ({ ...prev, clientName: '' }));
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500 ${errors.clientName ? 'border-red-500' : 'border-gray-300 border-[1px]'}`}
                // required eliminado, validación manual
              />
              {errors.clientName && <p className="text-red-600 text-sm mt-1">{errors.clientName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={e => {
                  setFormData({ ...formData, clientEmail: e.target.value });
                  if (errors.clientEmail) setErrors(prev => ({ ...prev, clientEmail: '' }));
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500 ${errors.clientEmail ? 'border-red-500' : 'border-gray-300 border-[1px]'}`}
                // required eliminado, validación manual
              />
              {errors.clientEmail && <p className="text-red-600 text-sm mt-1">{errors.clientEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu Teléfono *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={e => {
                  setFormData({ ...formData, clientPhone: e.target.value });
                  if (errors.clientPhone) setErrors(prev => ({ ...prev, clientPhone: '' }));
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500 ${errors.clientPhone ? 'border-red-500' : 'border-gray-300 border-[1px]'}`}
                placeholder="+56 9 xxxx xxxx"
                // required eliminado, validación manual
              />
              {errors.clientPhone && <p className="text-red-600 text-sm mt-1">{errors.clientPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa (Opcional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
              />
            </div>

            {/* Información del Servicio */}
            <div className="md:col-span-2">
              <h4 className="text-md font-semibold text-gray-800 mb-2 mt-4">¿Qué Necesitas?</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría de Servicio *
              </label>
              <select
                value={formData.categoryId}
                onChange={e => {
                  setFormData({ ...formData, categoryId: e.target.value });
                  if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: '' }));
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500 ${errors.categoryId ? 'border-red-500' : 'border-gray-300 border-[1px]'}`}
                // required eliminado, validación manual
                disabled={categoriaBloqueada}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué tan urgente es?
              </label>
              <select
                value={formData.urgency}
                onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
              >
                <option value="Bajo">No hay apuro</option>
                <option value="Medio">En un par de semanas</option>
                <option value="Alto">Lo antes posible</option>
                <option value="Urgente">¡Urgente!</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O Descríbenos tu Servicio
            </label>
            <input
              type="text"
              value={formData.customServiceTitle}
              onChange={e => setFormData({ ...formData, customServiceTitle: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
              placeholder="Ej: Diseño de logos, rotulado de vehículo..."
              disabled={!!formData.service}
            />
            <ServiceInfoAlert visible={!!formData.service} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuéntanos más sobre tu proyecto *
            </label>
            <textarea
                value={formData.description}
                onChange={e => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500 ${errors.description ? 'border-red-500' : 'border-gray-300 border-[1px]'}`}
                rows="4"
                placeholder="Describe tu proyecto, qué necesitas, colores preferidos, tamaño del vehículo si aplica, etc."
                
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Información Adicional
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
              rows="2"
              placeholder="Referencias, inspiraciones, presupuesto aproximado, fechas importantes..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-eiken-gradient text-white rounded-md hover:shadow-lg transition-shadow"
            >
              Enviar Cotización
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteModal;
