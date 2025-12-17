import React from 'react';
import { Quote, Eye } from 'lucide-react';

const QuoteDetailsModal = ({ isOpen, quote, onClose, getServiceTitle, getStatusColor }) => {
    if (!isOpen || !quote) return null;

    const API_URL = import.meta.env.VITE_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="details-modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Quote className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="details-modal-title">
                                    Detalles de Cotización
                                </h3>

                                <div className="mt-4 space-y-4">
                                    {/* Información del cliente */}
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Cliente</h4>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Nombre:</span>
                                                <p className="font-medium">{quote.clientName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Empresa:</span>
                                                <p className="font-medium">{quote.company || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Email:</span>
                                                <p className="font-medium text-blue-600">{quote.clientEmail}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Teléfono:</span>
                                                <p className="font-medium">{quote.clientPhone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Información del servicio */}
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Servicio Solicitado</h4>
                                        <p className="text-sm font-medium text-indigo-600">{getServiceTitle(quote)}</p>
                                        {quote.category?.name && (
                                            <p className="text-xs text-gray-500 mt-1">Categoría: {quote.category.name}</p>
                                        )}
                                    </div>

                                    {/* Descripción */}
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h4>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.description}</p>
                                    </div>

                                    {/* Fecha deseada de entrega */}
                                    {quote.requestedDeliveryDate && (
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Fecha Deseada de Entrega</h4>
                                            <p className="text-sm text-gray-600">
                                                {new Date(quote.requestedDeliveryDate).toLocaleDateString('es-CL')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Imágenes de referencia */}
                                    {quote.referenceImages && quote.referenceImages.length > 0 && (
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                                Imágenes de Referencia ({quote.referenceImages.length})
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {quote.referenceImages.map((image, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img
                                                            src={`${API_URL}/api/uploads/quotes/${image}`}
                                                            alt={`Referencia ${idx + 1}`}
                                                            className="w-full h-32 object-cover rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                                            onClick={() => window.open(`${API_URL}/api/uploads/quotes/${image}`, '_blank')}
                                                            onError={(e) => {
                                                                console.error('Error loading image:', `${API_URL}/uploads/${image}`);
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-opacity flex items-center justify-center">
                                                            <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 italic">
                                                Click en las imágenes para verlas en tamaño completo
                                            </p>
                                        </div>
                                    )}

                                    {/* Estado y monto cotizado */}
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Estado y Cotización</h4>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs text-gray-500">Estado Actual</span>
                                                <p className="mt-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                                                        {quote.status}
                                                    </span>
                                                </p>
                                            </div>
                                            {quote.quotedAmount && (
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-500">Monto Cotizado</span>
                                                    <p className="mt-1 text-lg font-bold text-green-600">
                                                        {new Intl.NumberFormat('es-CL', {
                                                            style: 'currency',
                                                            currency: 'CLP'
                                                        }).format(quote.quotedAmount)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notas */}
                                    {quote.notes && (
                                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Notas / Propuesta</h4>
                                            <p className="text-sm text-yellow-700 whitespace-pre-wrap">{quote.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetailsModal;
