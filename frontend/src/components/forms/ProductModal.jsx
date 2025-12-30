import { useState, useEffect } from 'react';
import { getImageUrl } from '@/helpers/getImageUrl';
import { showErrorAlert } from '@/helpers/sweetAlert';
import { categoriesAPI } from '@/services/apiService';
import ProductMaterialsSection from '@/components/products/ProductMaterialsSection';

const ProductModal = ({ isOpen, onClose, onSave, product, loading }) => {
    const [imageToDelete, setImageToDelete] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        price: '',
        stock: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState('');
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);

    // Cargar categorías al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            const categoriesData = response.data || response || [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([]);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        if (product) {
            const categoryIdValue = product.category?.id || product.categoryId || '';
            setFormData({
                name: product.name || '',
                description: product.description || '',
                categoryId: categoryIdValue.toString(),
                price: product.price ? Math.floor(Number(product.price)).toString() : '',
                stock: product.stock ? product.stock.toString() : '0',
                isActive: product.isActive !== undefined ? product.isActive : true
            });
            setImagePreview(product.image ? getImageUrl(product.image) : null);
            setImageToDelete(false);
        } else {
            setFormData({
                name: '',
                description: '',
                categoryId: '',
                price: '',
                stock: '',
                isActive: true
            });
            setImageFile(null);
            setImageError('');
            setImagePreview(null);
            setImageToDelete(false);
        }
        setErrors({});
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
        setImageError('');
        if (e.target.files[0]) {
            setImagePreview(URL.createObjectURL(e.target.files[0]));
            if (product && product.image) {
                setImageToDelete(true);
            }
        }
    };

    const handleDeleteImage = async () => {
        setImageToDelete(true);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Por favor ingresa el nombre del producto.';
        }
        if (!formData.description || !formData.description.trim()) {
            newErrors.description = 'Por favor ingresa una descripción.';
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'Por favor selecciona una categoría.';
        }
        if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0) {
            newErrors.price = 'Por favor ingresa un precio válido.';
        }
        if (!formData.stock || isNaN(formData.stock) || Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) {
            newErrors.stock = 'Por favor ingresa un stock válido.';
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        if (imageToDelete && product && product.id) {
            try {
                const baseUrl = import.meta.env.VITE_BASE_URL;
                const token = localStorage.getItem('token');
                const response = await fetch(`${baseUrl}/products/${product.id}/image`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    const result = await response.json();
                    showErrorAlert('Error', result.error || 'No se pudo eliminar la imagen');
                }
            } catch {
                showErrorAlert('Error', 'No se pudo eliminar la imagen');
            }
        }
        await onSave(formData, imageFile);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            >
                                <option value="">Selecciona una categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.categoryId && <p className="text-red-600 text-sm mt-1">{errors.categoryId}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="1"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                                    disabled={loading}
                                />
                                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    min="0"
                                    step="1"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                                    disabled={loading}
                                />
                                {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
                            {imagePreview && !imageToDelete && (
                                <div className="mb-2 flex items-center space-x-2">
                                    <img src={imagePreview} alt="Preview" className="h-20 rounded shadow" />
                                    <button
                                        type="button"
                                        onClick={handleDeleteImage}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                        disabled={loading}
                                    >
                                        Eliminar imagen
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {imageError && <p className="text-red-600 text-sm mt-1">{imageError}</p>}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={loading}
                                id="header-isActive"
                            />
                            <label htmlFor="header-isActive" className="ml-2 block text-sm text-gray-700">
                                Producto activo (visible en tienda)
                            </label>
                        </div>

                        {/* Sección de Materiales - Solo si el producto ya existe */}
                        {product && product.id && (
                            <ProductMaterialsSection productId={product.id} />
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={loading}
                            >
                                {product ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
