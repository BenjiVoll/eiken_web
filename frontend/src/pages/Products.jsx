import React, { useState, useEffect } from 'react';
import ProductsHeader from '../components/products/ProductsHeader';
import ProductsSearchBar from '../components/products/ProductsSearchBar';
import ProductsTable from '../components/products/ProductsTable';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '../helpers/sweetAlert';
import ImageModal from '../components/forms/ImageModal';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/apiService';
import { Settings } from 'lucide-react';
import { getImageUrl } from '../helpers/getImageUrl';
import ProductModal from '../components/forms/ProductModal';

const Products = () => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');
    const { isManager, isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll();
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (formData, imageFile) => {
        try {
            setModalLoading(true);
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
            };

            let savedProduct;
            if (editingProduct) {
                const response = await productsAPI.update(editingProduct.id, productData);
                savedProduct = response.data.data;
                showSuccessAlert('¡Actualizado!', 'El producto ha sido actualizado correctamente');
            } else {
                const response = await productsAPI.create(productData);
                savedProduct = response.data.data;
                showSuccessAlert('¡Creado!', 'El producto ha sido creado correctamente');
            }

            if (imageFile && savedProduct && savedProduct.id) {
                const formDataImg = new FormData();
                formDataImg.append('image', imageFile);
                const baseUrl = import.meta.env.VITE_BASE_URL;
                const token = localStorage.getItem('token');
                await fetch(`${baseUrl}/products/${savedProduct.id}/image`, {
                    method: 'POST',
                    body: formDataImg,
                    credentials: 'include',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (editingProduct) {
                    showSuccessAlert('¡Imagen subida!', 'La imagen del producto se ha subido correctamente');
                }
            }
            await loadProducts();
            setShowModal(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Error saving product:', error);
            let errorMessage = 'Error al guardar el producto';
            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const validationErrors = error.response.data.details.map(detail => detail.message || detail).join(', ');
                errorMessage = `Errores de validación: ${validationErrors}`;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            showErrorAlert('Error', errorMessage);
        } finally {
            setModalLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAlert('¿Estás seguro de que quieres eliminar este producto?', 'Esta acción no se puede deshacer');

        if (confirmed) {
            try {
                await productsAPI.delete(id);
                await loadProducts();
                showSuccessAlert('¡Eliminado!', 'El producto ha sido eliminado correctamente');
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                const errorMessage = error.response?.data?.message || error.message || 'No se pudo eliminar el producto';
                showErrorAlert('Error', errorMessage);
            }
        }
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setShowModal(false);
    };

    const filteredProducts = Array.isArray(products) ? products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProductsHeader isManager={isManager} isAdmin={isAdmin} onCreate={() => { setEditingProduct(null); setShowModal(true); }} />
            <ProductsSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <ProductsTable
                products={filteredProducts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatPrice={formatPrice}
                isManager={isManager}
                setModalImageUrl={setModalImageUrl}
                setShowImageModal={setShowImageModal}
                getImageUrl={getImageUrl}
            />
            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando un nuevo producto.'}
                    </p>
                </div>
            )}
            <ProductModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                product={editingProduct}
                loading={modalLoading}
            />
            <ImageModal
                isOpen={showImageModal}
                imageUrl={modalImageUrl}
                onClose={() => setShowImageModal(false)}
            />
        </div>
    );
};

export default Products;
