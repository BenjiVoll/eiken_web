import React, { useState, useEffect } from 'react';
import { quotesAPI } from '../services/apiService';
import { Quote, Search } from 'lucide-react';

const getServiceTitle = (quote) => {
  if (quote.service?.title) {
    return quote.service.title;
  }
  if (quote.customServiceTitle) {
    return quote.customServiceTitle;
  }
  return 'Sin servicio especificado';
};

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuotes();
  }, []);

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

  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      await quotesAPI.updateStatus(quoteId, newStatus);
      setQuotes(quotes.map(quote => 
        quote.id === quoteId 
          ? { ...quote, status: newStatus }
          : quote
      ));
    } catch { /* empty */ }
  };

  const filteredQuotes = quotes.filter(quote => {
    const searchLower = searchTerm.toLowerCase();
    const serviceTitle = getServiceTitle(quote);
    
    return quote.clientName.toLowerCase().includes(searchLower) ||
           (quote.company && quote.company.toLowerCase().includes(searchLower)) ||
           serviceTitle.toLowerCase().includes(searchLower);
  });

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
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Quote className="h-8 w-8 mr-3 text-pink-600" />
          Cotizaciones
        </h1>
        <p className="mt-2 text-gray-600">Solicitudes de cotización de clientes</p>
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
    </div>
  );
};

export default Quotes;
