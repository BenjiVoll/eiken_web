import React, { useState, useEffect } from 'react';
import { quotesAPI, projectsAPI, clientsAPI, divisionsAPI } from '../services/apiService';
import { Quote, Search, X, FolderPlus, FolderCheck } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '../helpers/sweetAlert';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const getServiceTitle = (quote) => {
  if (quote.service?.name) {
    return quote.service.name;
  }
  if (quote.customServiceTitle) {
    return quote.customServiceTitle;
  }
  if (quote.category?.name) {
    return quote.category.name;
  }
  return 'Sin servicio especificado';
};

const Quotes = () => {
  const { isManager, isAdmin } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Reply modal state - Moved to top to avoid hook order issues
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedQuoteForReply, setSelectedQuoteForReply] = useState(null);
  const [replyAmount, setReplyAmount] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  // Eliminar cotización
  const handleDeleteQuote = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar cotización?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (result.isConfirmed) {
      try {
        await quotesAPI.delete(id);
        await loadQuotes();
        Swal.fire('Eliminado', 'Cotización eliminada correctamente', 'success');
      } catch {
        Swal.fire('Error', 'No se pudo eliminar la cotización', 'error');
      }
    }
  };

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

      setQuotes(Array.isArray(quotes) ? quotes.map(quote =>
        quote.id === quoteId
          ? { ...quote, status: newStatus } // newStatus ya viene en inglés
          : quote
      ) : []);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const convertQuoteToProject = async (quote) => {
    try {
      const confirmed = await confirmAlert(
        'Convertir a Proyecto',
        '¿Deseas convertir esta cotización aprobada en un proyecto?'
      );
      if (!confirmed.isConfirmed) return;

      await quotesAPI.convert(quote.id);

      showSuccessAlert(
        '¡Proyecto Creado!',
        'La cotización ha sido convertida exitosamente en un proyecto'
      );
      loadQuotes();
    } catch (error) {
      console.error('Error converting quote to project:', error);
      if (error?.response?.data?.message) {
        showErrorAlert('Error', error.response.data.message);
      } else {
        showErrorAlert('Error', 'No se pudo convertir la cotización en proyecto');
      }
    }
  };

  const handleOpenReply = (quote) => {
    setSelectedQuoteForReply(quote);
    setReplyAmount(quote.quotedAmount || '');
    setReplyMessage('');
    setReplyModalOpen(true);
  };

  const handleCloseReply = () => {
    setReplyModalOpen(false);
    setSelectedQuoteForReply(null);
    setReplyAmount('');
    setReplyMessage('');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedQuoteForReply) return;

    try {
      await quotesAPI.reply(selectedQuoteForReply.id, {
        amount: parseFloat(replyAmount),
        message: replyMessage
      });

      showSuccessAlert('Respuesta Enviada', 'La cotización ha sido enviada al cliente.');
      handleCloseReply();
      loadQuotes();
    } catch (error) {
      console.error('Error replying to quote:', error);
      showErrorAlert('Error', 'No se pudo enviar la respuesta.');
    }
  };

  const filteredQuotes = Array.isArray(quotes)
    ? quotes.filter(quote => {
      const searchLower = searchTerm.toLowerCase();
      const serviceTitle = getServiceTitle(quote);
      return (
        (quote.clientName && quote.clientName.toLowerCase().includes(searchLower)) ||
        (quote.company && quote.company.toLowerCase().includes(searchLower)) ||
        serviceTitle.toLowerCase().includes(searchLower)
      );
    })
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'Aprobado':
        return 'bg-green-100 text-green-800';
      case 'converted':
      case 'Convertido':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
      case 'reviewing':
      case 'Revisando':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
      case 'Cotizado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Urgente':
        return 'text-red-600';
      case 'Alto':
        return 'text-orange-600';
      case 'Medio':
        return 'text-yellow-600';
      case 'Bajo':
        return 'text-green-600';
      default:
        return 'text-gray-600';
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

    if ((isAdmin || isManager) && isEditing) {
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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${((isAdmin || isManager) ? 'cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-blue-300 transition-all duration-200' : 'cursor-not-allowed opacity-60')} ${getStatusColor(selectedStatus)}`}
        onClick={() => (isAdmin || isManager) && setIsEditing(true)}
        title={isAdmin || isManager ? "Click para cambiar estado" : "Solo admin y manager pueden cambiar el estado"}
      >
        {selectedStatus} {isAdmin || isManager ? '✏️' : ''}
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
          {/* Botón de nueva cotización deshabilitado en intranet */}
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
                          {getServiceTitle(quote)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {quote.clientName} - {quote.company} • {quote.clientEmail}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        <StatusSelector quote={quote} />
                        <span className={`text-xs font-medium ${getUrgencyColor(quote.urgency)}`}>
                          {quote.urgency}
                        </span>

                        {/* Botón Responder */}
                        {(isAdmin || isManager) && (quote.status === 'Pendiente' || quote.status === 'Revisando' || quote.status === 'pending' || quote.status === 'reviewing') && (
                          <button
                            onClick={() => handleOpenReply(quote)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            title="Responder / Cotizar"
                          >
                            <Quote className="h-3 w-3 mr-1" />
                            Responder
                          </button>
                        )}

                        {(isAdmin || isManager) && (quote.status === 'Aprobado' || quote.status === 'approved') && quote.status !== 'Convertido' && quote.status !== 'converted' ? (
                          <button
                            onClick={() => convertQuoteToProject(quote)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            title="Convertir a Proyecto"
                          >
                            <FolderPlus className="h-3 w-3 mr-1" />
                            Proyecto
                          </button>
                        ) : null}
                        {(quote.status === 'Convertido' || quote.status === 'converted') && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            <FolderCheck className="h-3 w-3 mr-1" />
                            Convertido
                          </span>
                        )}
                        {/* Botón eliminar cotización */}
                        {isManager && (
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            title="Eliminar cotización"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
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
                        <p className="text-sm text-gray-600 italic whitespace-pre-wrap">{quote.notes}</p>
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

      {/* Modal de Respuesta */}
      {replyModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseReply}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitReply}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Quote className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Responder Cotización
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-4">
                          Ingresa el monto de la cotización y un mensaje detallado para el cliente.
                        </p>

                        <div className="mb-4">
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto (CLP)</label>
                          <input
                            type="number"
                            id="amount"
                            required
                            min="0"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={replyAmount}
                            onChange={(e) => setReplyAmount(e.target.value)}
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje / Propuesta</label>
                          <textarea
                            id="message"
                            required
                            rows="4"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Detalla aquí la propuesta..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Enviar Respuesta
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleCloseReply}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;
