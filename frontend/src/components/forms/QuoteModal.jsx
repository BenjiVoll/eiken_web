import React from 'react';
import ServiceInfoAlert from '@/components/alerts/ServiceInfoAlert';
import { X } from 'lucide-react';

const QuoteModal = ({
  show,
  onClose,
  onSubmit,
  formData = {},
  setFormData,
  services = [],
  categories = []
}) => {
  // Estados del Wizard
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 3;

  // Si el modal se abre con un servicio preseleccionado, no se puede cambiar ni la categoría ni el servicio
  const categoriaBloqueada = !!formData?.service;
  const [errors, setErrors] = React.useState({});

  if (!show) return null;

  // Funciones de navegación del wizard
  const nextStep = () => {
    // Validaciones por paso
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.clientName?.trim()) newErrors.clientName = 'Ingresa tu nombre';
      if (!formData.clientEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) newErrors.clientEmail = 'Email inválido';
      if (!formData.clientPhone?.trim()) newErrors.clientPhone = 'Ingresa tu teléfono';
      else if (!/^\+56\d{9}$/.test(formData.clientPhone.trim())) newErrors.clientPhone = 'Formato: +56912345678';
    }

    if (currentStep === 2) {
      if (!formData.categoryId) newErrors.categoryId = 'Selecciona una categoría';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.description?.trim()) newErrors.description = 'Describe tu proyecto';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Solicitar Cotización</h3>
            <p className="text-xs text-gray-500 mt-0.5">Paso {currentStep} de {totalSteps}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-eiken-gradient h-1.5 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Paso 1: Datos Personales */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <span className="bg-eiken-red-100 text-eiken-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  Tus Datos de Contacto
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={e => {
                        setFormData({ ...formData, clientName: e.target.value });
                        if (errors.clientName) setErrors({ ...errors, clientName: '' });
                      }}
                      className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 focus:border-eiken-red-500 outline-none transition-all ${errors.clientName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      placeholder="Tu nombre"
                      autoFocus
                    />
                    {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={e => {
                        setFormData({ ...formData, clientEmail: e.target.value });
                        if (errors.clientEmail) setErrors({ ...errors, clientEmail: '' });
                      }}
                      className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 focus:border-eiken-red-500 outline-none transition-all ${errors.clientEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      placeholder="ejemplo@correo.com"
                    />
                    {errors.clientEmail && <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={e => {
                          setFormData({ ...formData, clientPhone: e.target.value });
                          if (errors.clientPhone) setErrors({ ...errors, clientPhone: '' });
                        }}
                        className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 focus:border-eiken-red-500 outline-none transition-all ${errors.clientPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="+56 9..."
                      />
                      {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Empresa (Opcional)</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 outline-none"
                        placeholder="Nombre empresa"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Selección de Servicio */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <span className="bg-eiken-red-100 text-eiken-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  ¿Qué necesitas?
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio del Catálogo</label>
                  <select
                    value={formData.service || ''}
                    onChange={e => {
                      const selectedId = e.target.value;
                      const selectedService = services.find(s => String(s.id) === String(selectedId));
                      let newCategoryId = '';
                      if (selectedService) {
                        if (typeof selectedService.category === 'object' && selectedService.category !== null) newCategoryId = selectedService.category.id;
                        else if (typeof selectedService.category === 'number' || typeof selectedService.category === 'string') newCategoryId = selectedService.category;
                      }
                      setFormData({ ...formData, service: selectedId, categoryId: newCategoryId, customServiceTitle: '' });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 outline-none"
                  >
                    <option value="">-- Seleccionar del catálogo --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-400">O personalizados</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Otro Servicio</label>
                  <input
                    type="text"
                    value={formData.customServiceTitle}
                    onChange={e => setFormData({ ...formData, customServiceTitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="Ej: Rotulado especial..."
                    disabled={!!formData.service}
                  />
                  <ServiceInfoAlert visible={!!formData.service} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                    <select
                      value={formData.categoryId}
                      onChange={e => {
                        setFormData({ ...formData, categoryId: e.target.value });
                        if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
                      }}
                      className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 outline-none ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={categoriaBloqueada}
                    >
                      <option value="">Selecciona</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Ideal</label>
                    <input
                      type="date"
                      value={formData.requestedDeliveryDate || ''}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Detalles y Envío */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <span className="bg-eiken-red-100 text-eiken-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                  Detalles del Proyecto
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del poryecto *</label>
                  <textarea
                    value={formData.description}
                    onChange={e => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description) setErrors({ ...errors, description: '' });
                    }}
                    className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 outline-none h-24 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Cuéntanos los detalles..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes de Referencia (Máx 5)</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="text-sm text-gray-500"><span className="font-semibold">Click para subir</span> o arrastra</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files);
                        const existingFiles = formData.selectedImages || [];
                        const combinedFiles = [...existingFiles, ...newFiles].slice(0, 3);
                        setFormData({ ...formData, selectedImages: combinedFiles });
                      }}
                    />
                  </label>
                  {formData.selectedImages?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {formData.selectedImages.map((f, i) => (
                        <span key={i} className="text-xs bg-eiken-red-50 text-eiken-red-700 px-2 py-1 rounded border border-eiken-red-100">{f.name}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-eiken-red-500 outline-none h-16 resize-none"
                    placeholder="Presupuesto, dudas..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="text-gray-600 font-medium hover:text-gray-900 px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Atrás
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-eiken-gradient text-white px-8 py-2 rounded-lg font-medium hover:shadow-xl hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
            >
              Enviar Solicitud
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default QuoteModal;
