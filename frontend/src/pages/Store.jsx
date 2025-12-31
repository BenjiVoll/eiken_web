import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '@/services/apiService';
import { ShoppingCart, Search, ArrowLeft, Package } from 'lucide-react';
import { getImageUrl } from '@/helpers/getImageUrl';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import StoreSidebarFilters from '@/components/store/StoreSidebarFilters';
import { showSuccessAlert } from '@/helpers/sweetAlert';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { addToCart, getCartItemsCount } = useCart();

    // Estados de filtros
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await productsAPI.getActive();
                const productsData = response.data?.data || response.data || [];
                setProducts(Array.isArray(productsData) ? productsData : []);
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Calcular rango de precios cuando cargan los productos
    useEffect(() => {
        if (products.length > 0) {
            const prices = products.map(p => parseFloat(p.price) || 0);
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            setMinPrice(min);
            setMaxPrice(max);
            setPriceRange([min, max]);
        }
    }, [products]);

    const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setPriceRange([minPrice, maxPrice]);
        setSearchTerm('');
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(product.category?.name);

        const productPrice = parseFloat(product.price) || 0;
        const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];

        return matchesSearch && matchesCategory && matchesPrice;
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando productos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <Link
                            to="/"
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium hidden sm:inline">Volver</span>
                        </Link>

                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 absolute left-1/2 transform -translate-x-1/2">
                            <img src="/logo.png" alt="Eiken Design" className="h-10 w-auto" />
                            <div className="hidden md:block">
                                <h1 className="text-xl font-bold text-gray-900">EIKEN DESIGN</h1>
                                <p className="text-xs text-gray-600">Diseño Publicitario & Gráfica Vehicular</p>
                            </div>
                        </Link>

                        {/* Cart */}
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

            {/* Compact Header with Search */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
                            <p className="text-sm text-gray-600">Merchandising y productos personalizados</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative sm:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24">
                            <StoreSidebarFilters
                                categories={categories}
                                selectedCategories={selectedCategories}
                                onCategoryChange={handleCategoryChange}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                priceRange={priceRange}
                                onPriceChange={setPriceRange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Results Count */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Mostrando <span className="font-semibold">{filteredProducts.length}</span> de{' '}
                                <span className="font-semibold">{products.length}</span> productos
                            </p>
                        </div>

                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Product Image */}
                                        <div className="relative h-64 bg-gray-100 overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-20 w-20 text-gray-300" />
                                                </div>
                                            )}
                                            {product.stock <= 5 && product.stock > 0 && (
                                                <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                                    Últimas unidades
                                                </span>
                                            )}
                                            {product.stock === 0 && (
                                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    Agotado
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            {product.category && (
                                                <p className="text-xs text-blue-600 font-semibold mb-1">
                                                    {product.category.name}
                                                </p>
                                            )}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            {product.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {product.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {formatPrice(product.price)}
                                                </span>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={product.stock === 0}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${product.stock === 0
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                                                        }`}
                                                >
                                                    {product.stock === 0 ? 'Agotado' : 'Agregar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg">
                                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || selectedCategories.length > 0
                                        ? 'Intenta ajustar los filtros o términos de búsqueda'
                                        : 'No hay productos disponibles en este momento'}
                                </p>
                                {(selectedCategories.length > 0 || searchTerm || (priceRange[0] !== minPrice || priceRange[1] !== maxPrice)) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Limpiar todos los filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default Store;
