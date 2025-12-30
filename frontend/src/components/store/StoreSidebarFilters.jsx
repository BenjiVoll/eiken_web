import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Range, getTrackBackground } from 'react-range';

const StoreSidebarFilters = ({
    categories = [],
    selectedCategories = [],
    onCategoryChange,
    minPrice = 0,
    maxPrice = 100000,
    priceRange,
    onPriceChange,
    onClearFilters
}) => {
    const [showCategories, setShowCategories] = useState(true);
    const [showPrice, setShowPrice] = useState(true);

    const hasActiveFilters = selectedCategories.length > 0 ||
        (priceRange[0] !== minPrice || priceRange[1] !== maxPrice);

    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header with Clear Filters */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtrar</h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <X className="h-4 w-4" />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Categories Filter */}
            <div className="border-b border-gray-200 pb-4 mb-4">
                <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-medium text-gray-900">Categorías</span>
                    {showCategories ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </button>

                {showCategories && (
                    <div className="mt-3 space-y-2">
                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-500">Sin categorías disponibles</p>
                        ) : (
                            categories.map((category) => (
                                <label
                                    key={category}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => onCategoryChange(category)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                        {category}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Price Range Filter with Slider */}
            <div className="pb-4">
                <button
                    onClick={() => setShowPrice(!showPrice)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-medium text-gray-900">Precio</span>
                    {showPrice ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </button>

                {showPrice && (
                    <div className="mt-4 space-y-4">
                        {/* Price Values Display */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-600">Mínimo</span>
                                <span className="font-semibold text-gray-900">{formatPrice(priceRange[0])}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-xs text-gray-600">Máximo</span>
                                <span className="font-semibold text-gray-900">{formatPrice(priceRange[1])}</span>
                            </div>
                        </div>

                        {/* Range Slider */}
                        <div className="px-2 py-4">
                            <Range
                                values={priceRange}
                                step={1000}
                                min={minPrice}
                                max={maxPrice}
                                onChange={(values) => onPriceChange(values)}
                                renderTrack={({ props, children }) => (
                                    <div
                                        onMouseDown={props.onMouseDown}
                                        onTouchStart={props.onTouchStart}
                                        style={{
                                            ...props.style,
                                            height: '36px',
                                            display: 'flex',
                                            width: '100%'
                                        }}
                                    >
                                        <div
                                            ref={props.ref}
                                            style={{
                                                height: '6px',
                                                width: '100%',
                                                borderRadius: '4px',
                                                background: getTrackBackground({
                                                    values: priceRange,
                                                    colors: ['#E5E7EB', '#EF4444', '#E5E7EB'],
                                                    min: minPrice,
                                                    max: maxPrice
                                                }),
                                                alignSelf: 'center'
                                            }}
                                        >
                                            {children}
                                        </div>
                                    </div>
                                )}
                                renderThumb={({ props, isDragged }) => (
                                    <div
                                        {...props}
                                        style={{
                                            ...props.style,
                                            height: '20px',
                                            width: '20px',
                                            borderRadius: '50%',
                                            backgroundColor: '#EF4444',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                            outline: 'none',
                                            border: '3px solid white'
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '8px',
                                                width: '8px',
                                                backgroundColor: isDragged ? '#DC2626' : '#EF4444'
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        {/* Range Display */}
                        <div className="text-xs text-gray-600 text-center">
                            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                        </div>
                    </div>
                )}
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Filtros activos:</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((cat) => (
                            <span
                                key={cat}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                                {cat}
                                <button
                                    onClick={() => onCategoryChange(cat)}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreSidebarFilters;
