import React from 'react';
import { Package, Plus } from 'lucide-react';

const ProductsHeader = ({ isManager, isAdmin, onCreate }) => (
    <div className="services-header">
        <div className="services-header-flex">
            <div>
                <h1 className="services-title-flex">
                    <Package className="h-8 w-8 mr-3 text-blue-600" />
                    Productos
                </h1>
                <p className="services-description-flex">
                    Gestiona los productos de la tienda online
                </p>
            </div>
            {(isManager || isAdmin) && (
                <button
                    onClick={onCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                </button>
            )}
        </div>
    </div>
);

export default ProductsHeader;
