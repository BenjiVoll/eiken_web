import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/apiService';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { getImageUrl } from '../helpers/getImageUrl';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/cart/CartDrawer';
import { showSuccessAlert } from '../helpers/sweetAlert';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { addToCart, getCartItemsCount } = useCart();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getActive();
            // El backend devuelve { status, message, data }
            const productsData = response.data?.data || response.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        showSuccessAlert('¡Agregado!', `${product.name} se agregó al carrito`);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Tienda Online</h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="p-2 text-gray-400 hover:text-gray-500 relative"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {getCartItemsCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {getCartItemsCount()}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                        <Filter className="h-5 w-5 text-gray-400 mr-2" />
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                {category === 'all' ? 'Todos' : category}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No se encontraron productos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                                <div className="h-48 w-full bg-gray-200 relative overflow-hidden group">
                                    {product.image ? (
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No imagen
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                                        <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-600 mb-2">
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xl font-bold text-indigo-600">{formatPrice(product.price)}</span>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default Store;
