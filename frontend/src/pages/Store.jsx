import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/apiService';
import { ShoppingCart, Search, Filter, ArrowLeft } from 'lucide-react';
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

    const categories = ['all', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
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
            <div className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Botón Volver */}
                        <div className="flex items-center">
                            <Link
                                to="/"
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
                            >
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium hidden sm:inline">Volver</span>
                            </Link>
                        </div>

                        {/* Logo Central */}
                        <Link to="/" className="flex items-center space-x-3 absolute left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center">
                                <img
                                    src="/logo.png"
                                    alt="Eiken Design Logo"
                                    className="h-10 w-auto"
                                />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-xl font-bold text-gray-900">EIKEN DESIGN</h1>
                                <p className="text-xs text-gray-600">Diseño Publicitario & Gráfica Vehicular</p>
                            </div>
                        </Link>

                        {/* Carrito */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {getCartItemsCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {getCartItemsCount()}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>


                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Productos <span className="text-transparent bg-clip-text bg-gradient-to-r from-eiken-red-500 to-eiken-orange-500">Personalizados</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Merchandising corporativo y productos promocionales de alta calidad
                        </p>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap justify-center gap-6 mb-8">
                            <div className="flex items-center space-x-2">
                                <div className="bg-green-100 rounded-full p-1">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">Personalización incluida</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="bg-green-100 rounded-full p-1">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">Entregas rápidas</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="bg-green-100 rounded-full p-1">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">Calidad garantizada</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eiken-red-500 focus:border-eiken-red-500"
                            />
                        </div>

                        {/* Category Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                >
                                    {category === 'all' ? 'Todos' : category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
                        {filteredProducts.map((product, index) => (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                                <div className="h-64 w-full bg-gray-100 relative overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            Sin imagen
                                        </div>
                                    )}

                                    {/* Popular Badge */}
                                    {index < 2 && (
                                        <span className="absolute top-3 left-3 bg-gradient-to-r from-eiken-red-500 to-eiken-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            Popular
                                        </span>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="absolute top-3 right-3 flex flex-col space-y-2">
                                        <button className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md transition-all">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                        <button className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md transition-all">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                        {product.category?.name && (
                                            <span className="inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                                                {product.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                        <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="bg-gradient-to-r from-eiken-red-500 to-eiken-orange-500 text-white p-2.5 rounded-full hover:shadow-lg transition-all"
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
