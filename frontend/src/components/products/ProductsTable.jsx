import React from 'react';
import { Edit, Trash2, DollarSign, Package } from 'lucide-react';

const ProductsTable = ({ products, onEdit, onDelete, formatPrice, isManager, setModalImageUrl, setShowImageModal, getImageUrl }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center" style={{ borderBottom: '1px solid #eee' }}>
                    {product.image ? (
                        <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => {
                                setModalImageUrl(getImageUrl(product.image));
                                setShowImageModal(true);
                            }}
                        />
                    ) : (
                        <span className="text-gray-400 text-sm">Sin imagen</span>
                    )}
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {!product.isActive && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-full">
                                        🚫 Inactivo
                                    </span>
                                )}
                                {product.materialsCount > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                                        🔧 {product.materialsCount} {product.materialsCount === 1 ? 'material' : 'materiales'}
                                    </span>
                                )}
                            </div>
                        </div>
                        {isManager && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit(product)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(product.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {product.description}
                    </p>

                    {/* Lista de materiales */}
                    {product.materials && product.materials.length > 0 && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="text-xs font-semibold text-orange-800 mb-2 flex items-center gap-1">
                                🔧 Materiales ({product.materials.length})
                            </h4>
                            <ul className="space-y-1">
                                {product.materials.map((material, idx) => (
                                    <li key={idx} className="text-xs text-gray-700">
                                        • {material.inventory?.name || 'Material'}: {material.quantityNeeded} {material.inventory?.unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">Categoría:</span>
                            <span className="text-sm text-gray-900">{product.category?.name || 'Sin categoría'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500 flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                Stock:
                            </span>
                            <span className={`text-sm font-bold ${product.stock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                {product.stock}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-500 flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Precio:
                            </span>
                            <span className="text-lg font-bold text-green-600">
                                {formatPrice(product.price)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default ProductsTable;
