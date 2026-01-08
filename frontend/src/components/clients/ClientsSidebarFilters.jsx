import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Eye, Building2 } from 'lucide-react';

const ClientsSidebarFilters = ({
    clientTypes = [],
    selectedClientType = 'all',
    onClientTypeChange,
    visibility = 'all',
    onVisibilityChange,
    onClearFilters
}) => {
    const [showClientType, setShowClientType] = useState(true);
    const [showVisibility, setShowVisibility] = useState(true);

    const hasActiveFilters = selectedClientType !== 'all' || visibility !== 'all';

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 border border-gray-100">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Filtros
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
                    >
                        <X className="h-4 w-4" />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Visibilidad */}
            <div className="border-b border-gray-100 pb-4 mb-4">
                <button
                    onClick={() => setShowVisibility(!showVisibility)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Estado</span>
                    </div>
                    {showVisibility ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {showVisibility && (
                    <div className="mt-3 space-y-2">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'active', label: 'Activos' },
                            { id: 'inactive', label: 'Archivados' }
                        ].map((option) => (
                            <label key={option.id} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={visibility === option.id}
                                    onChange={() => onVisibilityChange(option.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Tipo de Cliente */}
            <div className="pb-4">
                <button
                    onClick={() => setShowClientType(!showClientType)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Tipo de Cliente</span>
                    </div>
                    {showClientType ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {showClientType && (
                    <div className="mt-3 space-y-2">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'individual', label: 'Particulares' },
                            { id: 'company', label: 'Empresas' }
                        ].map((option) => (
                            <label key={option.id} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="clientType"
                                    checked={selectedClientType === option.id}
                                    onChange={() => onClientTypeChange(option.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsSidebarFilters;
