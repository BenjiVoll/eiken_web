import React, { useState, useEffect } from 'react';
import { quotesAPI, servicesAPI } from '../services/apiService';
import { Quote, Search, Plus, X } from 'lucide-react';

const getServiceTitle = (quote) => {
  if (quote.service?.name) {
    return quote.service.name;
  }
  if (quote.customServiceTitle) {
    return quote.customServiceTitle;
  }
  return 'Sin servicio especificado';
};

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    company: '',
    serviceId: '',
    customServiceTitle: '',
    serviceType: 'otro',
    description: '',
    urgency: 'medium',
    notes: ''
  });

  useEffect(() => {
    loadQuotes();
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await quotesAPI.getAll();
      setQuotes(response.data || []);
    } catch {
      // Error al cargar cotizaciones
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quoteData = {
        ...formData,
        serviceId: formData.serviceId ? parseInt(formData.serviceId) : null
      };

      await quotesAPI.create(quoteData);
      await loadQuotes();
      resetForm();
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Error al crear la cotización');
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      company: '',
      serviceId: '',
      customServiceTitle: '',
      serviceType: 'otro',
      description: '',
      urgency: 'medium',
      notes: ''
    });
    setShowModal(false);
  };

  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      await quotesAPI.updateStatus(quoteId, newStatus);
      setQuotes(Array.isArray(quotes) ? quotes.map(quote => 
        quote.id === quoteId 
          ? { ...quote, status: newStatus }
          : quote
      ) : []);
    } catch { /* empty */ }
  };

  const filteredQuotes = Array.isArray(quotes) ? quotes.filter(quote => {
    const searchLower = searchTerm.toLowerCase();
    const serviceTitle = getServiceTitle(quote);
    
    return quote.clientName?.toLowerCase().includes(searchLower) ||
           (quote.company && quote.company.toLowerCase().includes(searchLower)) ||
           serviceTitle.toLowerCase().includes(searchLower);
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprobado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
      case 'Revisando':
        return 'bg-blue-100 text-blue-800';
      case 'Cotizado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Aprobado':
        return 'Aprobado';
      case 'Pendiente':
        return 'Pendiente';
      case 'Rechazado':
        return 'Rechazado';
      case 'Revisando':
        return 'Revisando';
      case 'Cotizado':
        return 'Cotizado';
      default:
        return status;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Urgente':
        return 'text-red-600';
      case 'Alta':
        return 'text-orange-600';
      case 'Media':
        return 'text-yellow-600';
      case 'Baja':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'Urgente':
        return 'Urgente';
      case 'Alta':
        return 'Alta';
      case 'Media':
        return 'Media';
      case 'Baja':
        return 'Baja';
      default:
        return urgency;
    }
  };

  const StatusSelector = ({ quote }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(quote.status);

    const statusOptions = [
      'Pendiente',
      'Revisando',
      'Cotizado',
      'Aprobado',
      'Rechazado'
    ];

    const handleStatusChange = async (newStatus) => {
      if (newStatus !== quote.status) {
        await updateQuoteStatus(quote.id, newStatus);
        setSelectedStatus(newStatus);
      }
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className="text-xs font-medium border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      );
    }

    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-blue-300 transition-all duration-200 ${getStatusColor(selectedStatus)}`}
        onClick={() => setIsEditing(true)}
        title="Click para cambiar estado"
      >
        {getStatusLabel(selectedStatus)} ✏️
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Quote className="h-8 w-8 mr-3 text-pink-600" />
              Cotizaciones
            </h1>
            <p className="mt-2 text-gray-600">Solicitudes de cotización de clientes</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cotizaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredQuotes.map((quote) => (
            <li key={quote.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {quote.clientName} - {quote.company}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getServiceTitle(quote)} • {quote.clientEmail}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        <StatusSelector quote={quote} />
                        <span className={`text-xs font-medium ${getUrgencyColor(quote.urgency)}`}>
                          {getUrgencyLabel(quote.urgency)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {quote.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            Tel: {quote.clientPhone}
                          </span>
                          {quote.quotedAmount && (
                            <span className="text-sm font-bold text-green-600">
                              {new Intl.NumberFormat('es-CL', {
                                style: 'currency',
                                currency: 'CLP'
                              }).format(quote.quotedAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {quote.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 italic">{quote.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12">
          <Quote className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron cotizaciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay cotizaciones registradas.'}
          </p>
        </div>
      )}

      {/* Modal para crear cotización */}
    {showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Nueva Cotización
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información del Cliente */}
              <div className="md:col-span-2">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Información del Cliente</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Cliente *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono del Cliente *
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Información del Servicio */}
              <div className="md:col-span-2">
                <h4 className="text-md font-semibold text-gray-800 mb-2 mt-4">Información del Servicio</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Servicio *
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="otro">Otro</option>
                  <option value="identidad-corporativa">Identidad Corporativa</option>
                  <option value="grafica-competicion">Gráfica de Competición</option>
                  <option value="wrap-vehicular">Wrap Vehicular</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgencia
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio del Catálogo
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value, customServiceTitle: e.target.value ? '' : formData.customServiceTitle })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Seleccionar servicio existente</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price?.toLocaleString('es-CL')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio Personalizado
                </label>
                <input
                  type="text"
                  value={formData.customServiceTitle}
                  onChange={(e) => setFormData({ ...formData, customServiceTitle: e.target.value, serviceId: e.target.value ? '' : formData.serviceId })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Título del servicio personalizado"
                  disabled={!!formData.serviceId}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.serviceId ? 'Desselecciona el servicio del catálogo para usar un servicio personalizado' : 'O especifica un servicio personalizado'}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Proyecto *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows="4"
                  placeholder="Describe detalladamente lo que necesitas..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows="2"
                  placeholder="Información adicional, referencias, etc."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Crear Cotización
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  );
};

export default Quotes;
