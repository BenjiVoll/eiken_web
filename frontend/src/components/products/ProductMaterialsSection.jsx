import { useState, useEffect } from 'react';
import { Trash2, Plus, Package } from 'lucide-react';
import { inventoryAPI, productsAPI } from '@/services/apiService';

export default function ProductMaterialsSection({ productId, onMaterialsChange }) {
    const [materials, setMaterials] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        inventoryId: '',
        quantityNeeded: ''
    });

    // Cargar items de inventario disponibles
    useEffect(() => {
        loadInventoryItems();
    }, []);

    // Cargar materiales del producto si ya existe
    useEffect(() => {
        if (productId) {
            loadProductMaterials();
        }
    }, [productId]);

    const loadInventoryItems = async () => {
        try {
            const response = await inventoryAPI.getAll();
            const items = response.data?.data?.inventory ||
                response.data?.inventory ||
                response.data?.data ||
                response.data ||
                [];
            setInventoryItems(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error('Error loading inventory:', error);
            setInventoryItems([]);
        }
    };

    const loadProductMaterials = async () => {
        try {
            const response = await productsAPI.getMaterials(productId);
            const materialsData = response.data?.data?.materials || [];
            setMaterials(Array.isArray(materialsData) ? materialsData : []);
        } catch (error) {
            console.error('Error loading product materials:', error);
            setMaterials([]);
        }
    };

    const handleAddMaterial = async () => {
        if (!newMaterial.inventoryId || !newMaterial.quantityNeeded) {
            alert('Debes seleccionar un material y especificar la cantidad');
            return;
        }

        // Si el producto ya existe, guardar en backend
        if (productId) {
            try {
                setLoading(true);
                await productsAPI.addMaterial(productId, {
                    inventoryId: parseInt(newMaterial.inventoryId),
                    quantityNeeded: parseFloat(newMaterial.quantityNeeded)
                });
                await loadProductMaterials();
                setNewMaterial({ inventoryId: '', quantityNeeded: '' });
            } catch (error) {
                console.error('Error adding material:', error);
                alert(error.response?.data?.message || 'Error al agregar material');
            } finally {
                setLoading(false);
            }
        } else {
            // Si el producto es nuevo, solo agregar a la lista local
            const inventoryItem = inventoryItems.find(i => i.id === parseInt(newMaterial.inventoryId));
            if (!inventoryItem) return;

            const materialData = {
                inventoryId: parseInt(newMaterial.inventoryId),
                quantityNeeded: parseFloat(newMaterial.quantityNeeded),
                inventory: inventoryItem
            };

            const updatedMaterials = [...materials, materialData];
            setMaterials(updatedMaterials);
            setNewMaterial({ inventoryId: '', quantityNeeded: '' });

            // Notificar al componente padre
            if (onMaterialsChange) {
                onMaterialsChange(updatedMaterials);
            }
        }
    };

    const handleRemoveMaterial = async (index, materialId) => {
        if (productId && materialId) {
            // Producto existente: eliminar del backend
            try {
                setLoading(true);
                await productsAPI.deleteMaterial(materialId);
                await loadProductMaterials();
            } catch (error) {
                console.error('Error removing material:', error);
                alert('Error al eliminar material');
            } finally {
                setLoading(false);
            }
        } else {
            // Producto nuevo: solo eliminar de la lista local
            const updatedMaterials = materials.filter((_, i) => i !== index);
            setMaterials(updatedMaterials);

            if (onMaterialsChange) {
                onMaterialsChange(updatedMaterials);
            }
        }
    };

    const getAvailableInventoryItems = () => {
        const usedIds = materials.map(m => m.inventoryId);
        return inventoryItems.filter(item => !usedIds.includes(item.id));
    };

    return (
        <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Package size={18} />
                Materiales Necesarios
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Define qué materiales del inventario se necesitan para producir 1 unidad de este producto
            </p>

            {/* Lista de materiales agregados */}
            {materials.length > 0 && (
                <div className="mb-4 space-y-2">
                    {materials.map((material, index) => (
                        <div
                            key={material.id || index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded border"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-sm">
                                    {material.inventory?.name || 'Material'}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Cantidad: {material.quantityNeeded} {material.inventory?.unit}
                                    {material.inventory?.quantity && (
                                        <span className="ml-2">
                                            (Disponible: {material.inventory.quantity} {material.inventory.unit})
                                        </span>
                                    )}
                                    {material.inventory?.quantity !== undefined && material.quantityNeeded > material.inventory.quantity && (
                                        <span className="block mt-1 text-orange-600 font-medium text-xs flex items-center">
                                            ⚠️ Advertencia: Stock actual insuficiente para producir 1 unidad
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => handleRemoveMaterial(index, material.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Eliminar material"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Agregar nuevo material */}
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Material
                        </label>
                        <select
                            value={newMaterial.inventoryId}
                            onChange={(e) => setNewMaterial({ ...newMaterial, inventoryId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="">Seleccionar material...</option>
                            {getAvailableInventoryItems().map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.quantity} {item.unit} disponibles)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad Necesaria
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newMaterial.quantityNeeded}
                            onChange={(e) => setNewMaterial({ ...newMaterial, quantityNeeded: e.target.value })}
                            placeholder="Ej: 2.5"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    onClick={handleAddMaterial}
                    disabled={loading || !newMaterial.inventoryId || !newMaterial.quantityNeeded}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus size={16} />
                    Agregar Material
                </button>
            </div>

            {materials.length === 0 && (
                <p className="text-sm text-gray-500 italic mt-4">
                    ℹ️ No hay materiales asociados. Este producto no descontará inventario automáticamente.
                </p>
            )}
        </div>
    );
}
