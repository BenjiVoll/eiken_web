import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter, Search } from 'lucide-react';
import { Range, getTrackBackground } from 'react-range';

const StoreSidebarFilters = ({
    categories = [],
    selectedCategories = [],
    onCategoryChange,
    minPrice = 0,
    maxPrice = 100000,
    priceRange,
    onPriceChange,
    onClearFilters,
    searchTerm,
    onSearchChange
}) => {
    const [showCategories, setShowCategories] = useState(true);
    const [showPrice, setShowPrice] = useState(true);

    const hasActiveFilters = selectedCategories.length > 0 ||
        (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) ||
        searchTerm !== '';

    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Search Bar in Sidebar */}
            <div className="mb-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-700"
                    />
                </div>
            </div>

            {/* Header with Clear Filters */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <h3 className="text-gray-900 font-bold flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    Filtros
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded-md transition-colors"
                    >
                        Limpiar todo
                    </button>
                )}
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
                <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="flex items-center justify-between w-full text-left mb-3 group"
                >
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Categorías</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
                </button>

                {showCategories && (
                    <div className="space-y-2 pl-1">
                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Sin categorías</p>
                        ) : (
                            categories.map((category) => (
                                <label
                                    key={category}
                                    className="flex items-center gap-3 cursor-pointer group py-1"
                                >
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => onCategoryChange(category)}
                                            className="peer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                                        />
                                    </div>
                                    <span className={`text-sm transition-colors ${selectedCategories.includes(category) ? 'text-indigo-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {category}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-2">
                <button
                    onClick={() => setShowPrice(!showPrice)}
                    className="flex items-center justify-between w-full text-left mb-4 group"
                >
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">Precio</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showPrice ? 'rotate-180' : ''}`} />
                </button>

                {showPrice && (
                    <div className="space-y-6 px-1">
                        {/* Range Slider */}
                        <div className="px-1 py-2">
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
                                                height: '4px',
                                                width: '100%',
                                                borderRadius: '2px',
                                                background: getTrackBackground({
                                                    values: priceRange,
                                                    colors: ['#F3F4F6', '#6366F1', '#F3F4F6'],
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
                                            height: '18px',
                                            width: '18px',
                                            borderRadius: '50%',
                                            backgroundColor: '#fff',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                            border: '2px solid #6366F1',
                                            outline: 'none'
                                        }}
                                    >
                                        {isDragged && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Price Values Inputs/Display */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 w-full text-center">
                                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Mín</span>
                                <span className="text-sm font-bold text-gray-800">{formatPrice(priceRange[0])}</span>
                            </div>
                            <div className="text-gray-300">-</div>
                            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 w-full text-center">
                                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Máx</span>
                                <span className="text-sm font-bold text-gray-800">{formatPrice(priceRange[1])}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreSidebarFilters;
