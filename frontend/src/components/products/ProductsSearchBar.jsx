import React from 'react';
import { Search } from 'lucide-react';

const ProductsSearchBar = ({ searchTerm, setSearchTerm }) => (
    <div className="services-search">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="services-search-input"
            />
        </div>
    </div>
);

export default ProductsSearchBar;
