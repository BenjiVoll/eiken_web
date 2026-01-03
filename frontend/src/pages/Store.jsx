import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '@/services/apiService';
import { ShoppingCart, ArrowLeft, Package, Sparkles } from 'lucide-react';
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
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-light">Preparando la experiencia...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header / Navbar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo Link */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <img src="/logo.png" alt="Eiken Design" className="h-10 w-auto transition-transform group-hover:scale-105" />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">EIKEN DESIGN</h1>
                                <p className="text-xs text-gray-500 font-medium tracking-wide">DISEÑO & CALIDAD</p>
                            </div>
                        </Link>

                        {/* Back & Cart */}
                        <div className="flex items-center gap-6">
                            <Link
                                to="/"
                                className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors group"
                            >
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium hidden sm:inline">Volver al Inicio</span>
                            </Link>

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {getCartItemsCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm animate-bounce-short">
                                        {getCartItemsCount()}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- HERO SECTION (Compact) --- */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern-bg.png')] opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-center">
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-orange-300 uppercase bg-orange-900/30 rounded-full backdrop-blur-sm border border-orange-500/20">
                        Tienda Oficial
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                        Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Productos</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-sm text-slate-300 font-light">
                        Merchandising exclusivo y diseños personalizados.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24 transition-all duration-300">
                            <StoreSidebarFilters
                                categories={categories}
                                selectedCategories={selectedCategories}
                                onCategoryChange={handleCategoryChange}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                priceRange={priceRange}
                                onPriceChange={setPriceRange}
                                onClearFilters={handleClearFilters}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                            <p className="text-sm text-gray-500">
                                Mostrando <span className="font-semibold text-gray-900">{filteredProducts.length}</span> resultados
                            </p>
                            {/* Sort dropdown could go here in future */}
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group bg-white rounded-2xl p-3 hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1 border border-transparent hover:border-orange-50/50"
                                    >
                                        <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-100">
                                            {product.image ? (
                                                <>
                                                    <img
                                                        src={getImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                    <Package className="h-16 w-16 text-gray-200 group-hover:text-orange-200 transition-colors" />
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none">
                                                {product.stock === 0 && (
                                                    <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                                                        AGOTADO
                                                    </span>
                                                )}
                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <span className="bg-amber-400/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                                                        ¡ÚLTIMAS!
                                                    </span>
                                                )}
                                                {/* Optional: Add "NEW" badge logic here */}
                                            </div>
                                        </div>

                                        <div className="pt-4 px-1 pb-1">
                                            {product.category && (
                                                <p className="text-xs font-semibold text-orange-500 mb-1 uppercase tracking-wider">
                                                    {product.category.name}
                                                </p>
                                            )}
                                            <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight group-hover:text-orange-700 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed mb-4">
                                                {product.description || 'Sin descripción disponible.'}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-50/50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase">Precio</span>
                                                    <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={product.stock === 0}
                                                    className={`
                                                        px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-300 transform
                                                        ${product.stock === 0
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-slate-900 text-white hover:bg-orange-600 hover:shadow-orange-500/30 active:scale-95'
                                                        }
                                                    `}
                                                >
                                                    {product.stock === 0 ? 'Sin Stock' : 'Agregar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                                <Sparkles className="mx-auto h-16 w-16 text-orange-200 mb-4 animate-pulse" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                    Parece que no hay coincidencias para tu búsqueda. Intenta simplificar los filtros.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="text-orange-600 hover:text-orange-800 font-semibold text-sm hover:underline"
                                >
                                    Limpiar todos los filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default Store;
