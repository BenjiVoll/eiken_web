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
      let clientId = null;
      try {
        const clientsResponse = await clientsAPI.getAll();
        const clients = Array.isArray(clientsResponse) ? clientsResponse : [];
        const existingClient = clients.find(client => 
          client.email === quote.clientEmail || 
          client.name === quote.clientName ||
          client.company === quote.company
        );
        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const newClientData = {
            name: quote.clientName,
            email: quote.clientEmail,
            phone: quote.clientPhone,
            company: quote.company || '',
            clientType: quote.company ? 'company' : 'individual'
          };
          const newClientResponse = await clientsAPI.create(newClientData);
          clientId = newClientResponse.id;
        }
      } catch (error) {
        console.error('Error managing client:', error);
        showErrorAlert('Error', 'No se pudo gestionar la información del cliente');
        return;
      }
      let divisionId = typeof quote.service?.division === 'number' ? quote.service.division : null;
      const categoryId = typeof quote.category?.id === 'number'
        ? quote.category.id
        : typeof quote.categoryId === 'number'
          ? quote.categoryId
          : null;
      if (!divisionId) {
        let divisions = await divisionsAPI.getAll();
        if (divisions && typeof divisions === 'object' && Array.isArray(divisions.data)) {
          divisions = divisions.data;
        }
        const optionsHtml = `<option value="">Selecciona una división</option>` + divisions.map(div => `<option value="${div.id}">${div.name}</option>`).join('');
        let selectedDivision = null;
        while (!selectedDivision) {
          const { value } = await Swal.fire({
            title: 'Selecciona la división para el proyecto',
            html: `<select id="division-select" class="swal2-input">${optionsHtml}</select>`,
            focusConfirm: false,
            preConfirm: () => {
              const select = document.getElementById('division-select');
              return select ? select.value : null;
            },
            showCancelButton: true,
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar',
          });
          if (!value || value === "") {
            const result = await Swal.fire('Error', 'Debes seleccionar una división para continuar.', 'error');
            if (result.isDismissed || result.isDenied) return;
          } else {
            selectedDivision = value;
          }
        }
        divisionId = Number(selectedDivision);
      }
      if (!categoryId) {
        showErrorAlert('Error', 'La cotización no tiene una categoría válida. No se puede convertir a proyecto.');
        return;
      }
      const projectData = {
        title: getServiceTitle(quote),
        description: quote.description,
        clientId: clientId,
        categoryId: categoryId,
        division: divisionId,
        status: 'Aprobado',
        priority: quote.urgency,
        budgetAmount: quote.quotedAmount || null,
        notes: quote.notes || ''
      };
      await projectsAPI.create(projectData);
      showSuccessAlert(
        '¡Proyecto Creado!', 
        'La cotización ha sido convertida exitosamente en un proyecto'
      );
      await updateQuoteStatus(quote.id, 'Convertido');
      loadQuotes();
    } catch (error) {
      console.error('Error converting quote to project:', error);
      // Si el error es 400, mostrar mensaje específico
      if (error?.response?.status === 400) {
        showErrorAlert('Error', 'Esta cotización ya fue convertida en proyecto.');
      } else {
        showErrorAlert('Error', 'No se pudo convertir la cotización en proyecto');
      }
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
                        {(quote.status === 'Aprobado' || quote.status === 'approved') && quote.status !== 'Convertido' && quote.status !== 'converted' ? (
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
