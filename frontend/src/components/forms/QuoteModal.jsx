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

        <form onSubmit={onSubmit} className="space-y-4">
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
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu Teléfono *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                placeholder="+56 9 xxxx xxxx"
                required
              />
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
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                required
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
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
              rows="4"
              placeholder="Describe tu proyecto, qué necesitas, colores preferidos, tamaño del vehículo si aplica, etc."
              required
            />
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
