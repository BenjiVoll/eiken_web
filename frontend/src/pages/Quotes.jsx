import React, { useState, useEffect, useRef } from 'react';
import { quotesAPI } from '@/services/apiService';
import {
  Quote,
  Search,
  X,
  FolderPlus,
  FolderCheck,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { showSuccessAlert, showErrorAlert, deleteDataAlert, createDataAlert } from '@/helpers/sweetAlert';
import { getErrorMessage } from '@/helpers/errorHelper';
import { useAuth } from '@/context/AuthContext';
import QuoteDetailsModal from '@/components/modals/QuoteDetailsModal';

const getServiceTitle = (quote) => {
  if (quote.service?.name) return quote.service.name;
  if (quote.customServiceTitle) return quote.customServiceTitle;
  if (quote.category?.name) return quote.category.name;
  return 'Sin servicio especificado';
};

const Quotes = () => {
  const { isManager, isAdmin } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Estado del modal de respuesta
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedQuoteForReply, setSelectedQuoteForReply] = useState(null);
  const [replyAmount, setReplyAmount] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  // Estado del modal de detalles
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedQuoteForDetails, setSelectedQuoteForDetails] = useState(null);

  // Estado para el menú desplegable (kebab menu)
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadQuotes();

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await quotesAPI.getAll();
      setQuotes(response.data || []);
    } catch {
      // Error handling silencioso o toast
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (id) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      try {
        await quotesAPI.delete(id);
        await loadQuotes();
        showSuccessAlert('Eliminado', 'Cotización eliminada correctamente');
      } catch (error) {
        showErrorAlert('Error', getErrorMessage(error, 'No se pudo eliminar la cotización'));
      }
    }
  };

  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      await quotesAPI.updateStatus(quoteId, newStatus);
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const convertQuoteToProject = async (quote) => {
    /* ... lógica existente ... */
    try {
      const result = await createDataAlert('Proyecto a partir de Cotización');

      if (!result.isConfirmed) return;

      await quotesAPI.convert(quote.id);
      showSuccessAlert('¡Proyecto Creado!', 'La cotización ha sido convertida exitosamente');
      loadQuotes();
    } catch (error) {
      showErrorAlert('Error', getErrorMessage(error, 'No se pudo convertir'));
    }
  };

  const handleOpenReply = (quote) => {
    setSelectedQuoteForReply(quote);
    setReplyAmount(quote.quotedAmount || '');
    setReplyMessage('');
    setReplyModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedQuoteForReply) return;
    try {
      await quotesAPI.reply(selectedQuoteForReply.id, {
        amount: parseFloat(replyAmount),
        message: replyMessage
      });
      showSuccessAlert('Respuesta Enviada', 'Cotización enviada al cliente.');
      setReplyModalOpen(false);
      loadQuotes();
    } catch (error) {
      showErrorAlert('Error', getErrorMessage(error, 'No se pudo enviar la respuesta.'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': case 'Aprobado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'converted': case 'Convertido': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': case 'Pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected': case 'Rechazado': return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewing': case 'Revisando': case 'En Revisión': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'quoted': case 'Cotizado': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const StatusSelector = ({ quote }) => {
    const [isEditing, setIsEditing] = useState(false);

    if ((isAdmin || isManager) && isEditing) {
      return (
        <select
          value={quote.status}
          onChange={async (e) => {
            await updateQuoteStatus(quote.id, e.target.value);
            setIsEditing(false);
          }}
          onBlur={() => setIsEditing(false)}
          className="text-xs font-medium border-slate-300 rounded-lg py-1 pl-2 pr-8 focus:ring-orange-500 focus:border-orange-500"
          autoFocus
        >
          {['Pendiente', 'Revisando', 'Cotizado', 'Aprobado', 'Rechazado'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      );
    }

    return (
      <span
        onClick={() => (isAdmin || isManager) && setIsEditing(true)}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(quote.status)} 
          ${(isAdmin || isManager) ? 'cursor-pointer hover:shadow-sm transition-all' : ''}`}
      >
        {quote.status}
      </span>
    );
  };

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'reviewing', label: 'En Revisión' },
    { id: 'quoted', label: 'Cotizados' },
    { id: 'approved', label: 'Aprobados' },
    { id: 'rejected', label: 'Rechazados' },
  ];

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = getServiceTitle(quote).toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['Pending', 'Pendiente'].includes(quote.status);
    if (activeTab === 'reviewing') return ['Reviewing', 'Revisando', 'En Revisión'].includes(quote.status);
    if (activeTab === 'quoted') return ['Quoted', 'Cotizado'].includes(quote.status);
    if (activeTab === 'approved') return ['Approved', 'Aprobado', 'Convertido'].includes(quote.status);
    if (activeTab === 'rejected') return ['Rejected', 'Rechazado'].includes(quote.status);

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Quote className="h-7 w-7 text-orange-600" />
            Gestión de Cotizaciones
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Administra las solicitudes y proyectos potenciales</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative
              ${activeTab === tab.id
                ? 'text-orange-600 bg-orange-50 after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-orange-500'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        /* Quotes Grid/List */
        <div className="space-y-4">
          {filteredQuotes.length > 0 ? filteredQuotes.map(quote => (
            <div key={quote.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow relative">
              {/* Card Header & Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg leading-tight">
                      {getServiceTitle(quote)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      N° Cotización #{quote.id.toString().padStart(4, '0')} • {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StatusSelector quote={quote} />
              </div>

              {/* Card Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12 mb-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-sm font-medium text-slate-700">{quote.client?.name}</p>
                  <p className="text-xs text-slate-500">{quote.client?.company}</p>
                  <p className="text-xs text-slate-400 mt-1">{quote.client?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Detalles</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{quote.description}</p>
                  {quote.quotedAmount && (
                    <p className="mt-2 font-bold text-slate-900 text-base">
                      {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(quote.quotedAmount)}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 ml-12">
                {/* Primary Action Button (Conditioned) */}
                <div>
                  {['Pendiente', 'Revisando', 'pending'].includes(quote.status) && (isAdmin || isManager) && (
                    <button
                      onClick={() => handleOpenReply(quote)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200"
                    >
                      <MessageSquare className="h-4 w-4" /> Responder
                    </button>
                  )}
                </div>

                {/* Kebab Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === quote.id ? null : quote.id);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === quote.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    >
                      <button
                        onClick={() => {
                          setSelectedQuoteForDetails(quote);
                          setDetailsModalOpen(true);
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4 text-slate-400" /> Ver Detalles
                      </button>

                      {['Aprobado', 'approved'].includes(quote.status) && (isAdmin || isManager) && (
                        <button
                          onClick={() => {
                            convertQuoteToProject(quote);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm text-emerald-700 flex items-center gap-2"
                        >
                          <FolderPlus className="h-4 w-4" /> Convertir a Proyecto
                        </button>
                      )}

                      {isManager && (
                        <button
                          onClick={() => {
                            handleDeleteQuote(quote.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 border-t border-slate-100"
                        >
                          <X className="h-4 w-4" /> Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderCheck className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No hay cotizaciones</h3>
              <p className="text-slate-500">No se encontraron registros en esta categoría.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Responder Cotización</h3>
              <button onClick={() => setReplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReply} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Monto (CLP)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={replyAmount}
                  onChange={(e) => setReplyAmount(e.target.value)}
                  className="w-full border border-slate-300 bg-slate-50 rounded-lg focus:ring-orange-500 focus:border-orange-500 p-2.5"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mensaje / Propuesta</label>
                <textarea
                  rows="4"
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full border border-slate-300 bg-slate-50 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm p-3"
                  placeholder="Describe tu propuesta aquí..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-md shadow-orange-200"
                >
                  Enviar Respuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QuoteDetailsModal
        isOpen={detailsModalOpen}
        quote={selectedQuoteForDetails}
        onClose={() => setDetailsModalOpen(false)}
        getServiceTitle={getServiceTitle}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default Quotes;
