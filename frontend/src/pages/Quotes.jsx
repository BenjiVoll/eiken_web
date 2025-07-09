import React, { useState, useEffect } from 'react';
import { quotesAPI } from '../services/apiService';
import { Quote, Search } from 'lucide-react';

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
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_process':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazada';
      case 'in_process':
        return 'En Proceso';
      default:
        return status;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return urgency;
    }
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
                          {quote.serviceType} • {quote.clientEmail}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusLabel(quote.status)}
                        </span>
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
                          {quote.estimatedAmount && (
                            <span className="text-sm font-bold text-green-600">
                              {new Intl.NumberFormat('es-CL', {
                                style: 'currency',
                                currency: 'CLP'
                              }).format(quote.estimatedAmount)}
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
