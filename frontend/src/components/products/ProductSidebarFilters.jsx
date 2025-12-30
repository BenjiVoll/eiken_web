import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Box, Eye, Layers } from 'lucide-react';

const ProductSidebarFilters = ({
    categories = [],
    selectedCategories = [],
    onCategoryChange,
    stockStatus = 'all',
    onStockStatusChange,
    visibility = 'all',
    onVisibilityChange,
    onClearFilters
}) => {
    const [showCategories, setShowCategories] = useState(true);
    const [showStock, setShowStock] = useState(true);
    const [showVisibility, setShowVisibility] = useState(true);

    const hasActiveFilters = selectedCategories.length > 0 ||
        stockStatus !== 'all' ||
        visibility !== 'all';

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 border border-gray-100">
            {/* Header with Clear Filters */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Filtros de Gestión
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

            {/* Visibility Filter (Critical for Admin) */}
            <div className="border-b border-gray-100 pb-4 mb-4">
                <button
                    onClick={() => setShowVisibility(!showVisibility)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Visibilidad</span>
                    </div>
                    {showVisibility ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {showVisibility && (
                    <div className="mt-3 space-y-2">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'active', label: 'Activos (En tienda)' },
                            { id: 'inactive', label: 'Inactivos (Ocultos)' }
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

            {/* Stock Status Filter (Critical for Admin) */}
            <div className="border-b border-gray-100 pb-4 mb-4">
                <button
                    onClick={() => setShowStock(!showStock)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Estado de Stock</span>
                    </div>
                    {showStock ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {showStock && (
                    <div className="mt-3 space-y-2">
                        {[
                            { id: 'all', label: 'Todos', color: 'bg-gray-400' },
                            { id: 'out', label: 'Agotado (0)', color: 'bg-red-500' },
                            { id: 'low', label: 'Stock Bajo (1-5)', color: 'bg-orange-500' },
                            { id: 'in', label: 'En Stock (>5)', color: 'bg-green-500' }
                        ].map((status) => (
                            <label key={status.id} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="stockStatus"
                                    checked={stockStatus === status.id}
                                    onChange={() => onStockStatusChange(status.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                        {status.label}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Categories Filter */}
            <div className="pb-4">
                <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Categorías</span>
                    </div>
                    {showCategories ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {showCategories && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Sin categorías</p>
                        ) : (
                            categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => onCategoryChange(category.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 transition-colors">
                                        {category.name}
                                    </span>
                                    {category.count !== undefined && (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                            {category.count}
                                        </span>
                                    )}
                                </label>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSidebarFilters;
