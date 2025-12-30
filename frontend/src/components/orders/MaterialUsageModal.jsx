import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { inventoryAPI, ordersAPI } from '@/services/apiService';

const MaterialUsageModal = ({ isOpen, onClose, orderId, onSuccess }) => {
    const [availableInventory, setAvailableInventory] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [currentMaterial, setCurrentMaterial] = useState({
        inventoryId: '',
        quantityUsed: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInventory();
        }
    }, [isOpen]);

    const loadInventory = async () => {
        try {
            const response = await inventoryAPI.getAll();
            setAvailableInventory(response.data.data || []);
        } catch (error) {
            console.error('Error loading inventory:', error);
            setError('Error al cargar inventario');
        }
    };

    const selectedItem = availableInventory.find(
        i => i.id === parseInt(currentMaterial.inventoryId)
    );

    const handleAddMaterial = () => {
        if (!currentMaterial.inventoryId || !currentMaterial.quantityUsed) {
            setError('Debes seleccionar un material y cantidad');
            return;
        }

        const quantity = parseFloat(currentMaterial.quantityUsed);
        if (quantity <= 0) {
            setError('La cantidad debe ser mayor a  0');
            return;
        }

        if (selectedItem && quantity > selectedItem.quantity) {
            setError(`Stock insuficiente. Disponible: ${selectedItem.quantity} ${selectedItem.unit}`);
            return;
        }

        // Verificar si ya fue agregado
        if (selectedMaterials.some(m => m.inventoryId === parseInt(currentMaterial.inventoryId))) {
            setError('Este material ya fue agregado');
            return;
        }

        setSelectedMaterials([...selectedMaterials, {
            inventoryId: parseInt(currentMaterial.inventoryId),
            quantityUsed: quantity,
            notes: currentMaterial.notes,
            inventoryName: selectedItem.name,
            inventoryUnit: selectedItem.unit,
            currentStock: selectedItem.quantity,
            minStock: selectedItem.minStock
        }]);

        setCurrentMaterial({ inventoryId: '', quantityUsed: '', notes: '' });
        setError('');
    };

    const handleRemoveMaterial = (inventoryId) => {
        setSelectedMaterials(selectedMaterials.filter(m => m.inventoryId !== inventoryId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedMaterials.length === 0) {
            setError('Debes agregar al menos un material');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const materialsToSend = selectedMaterials.map(m => ({
                inventoryId: m.inventoryId,
                quantityUsed: m.quantityUsed,
                notes: m.notes
            }));

            await ordersAPI.registerMaterials(orderId, materialsToSend);
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error registering materials:', error);
            setError(error.response?.data?.message || 'Error al registrar materiales');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedMaterials([]);
        setCurrentMaterial({ inventoryId: '', quantityUsed: '', notes: '' });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const willTriggerAlert = selectedMaterials.some(m => {
        const newStock = m.currentStock - m.quantityUsed;
        return newStock <= m.minStock;
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Registrar Materiales Usados
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Alert Warning */}
                    {willTriggerAlert && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <strong>Atención:</strong> Uno o más materiales llegarán a stock mínimo. Se enviará una alerta automática.
                            </div>
                        </div>
                    )}

                    {/* Add Material Form */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Agregar Material</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {/* Select Material */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Material
                                </label>
                                <select
                                    value={currentMaterial.inventoryId}
                                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, inventoryId: e.target.value, quantityUsed: '' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">Seleccionar material...</option>
                                    {availableInventory.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} - {item.color || 'N/A'} ({item.quantity} {item.unit} disponibles)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad Usada
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={selectedItem?.quantity || ''}
                                        value={currentMaterial.quantityUsed}
                                        onChange={(e) => setCurrentMaterial({ ...currentMaterial, quantityUsed: e.target.value })}
                                        placeholder={selectedItem ? `Máx: ${selectedItem.quantity}` : '0'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    {selectedItem && (
                                        <span className="absolute right-3 top-2 text-sm text-gray-500">
                                            {selectedItem.unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas (opcional)
                            </label>
                            <input
                                type="text"
                                value={currentMaterial.notes}
                                onChange={(e) => setCurrentMaterial({ ...currentMaterial, notes: e.target.value })}
                                placeholder="Ej: Usado para rotulación lateral"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleAddMaterial}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4" />
                            Agregar Material
                        </button>
                    </div>

                    {/* Selected Materials List */}
                    {selectedMaterials.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Materiales Agregados ({selectedMaterials.length})
                            </h3>
                            <div className="space-y-2">
                                {selectedMaterials.map(material => {
                                    const newStock = material.currentStock - material.quantityUsed;
                                    const isLowStock = newStock <= material.minStock;

                                    return (
                                        <div
                                            key={material.inventoryId}
                                            className={`p-3 rounded-md border ${isLowStock ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-800">{material.inventoryName}</p>
                                                        {isLowStock && (
                                                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                                                                Stock Bajo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Cantidad: <strong>{material.quantityUsed} {material.inventoryUnit}</strong>
                                                        {isLowStock && (
                                                            <span className="text-yellow-700 ml-2">
                                                                (Nuevo stock: {newStock.toFixed(2)} {material.inventoryUnit})
                                                            </span>
                                                        )}
                                                    </p>
                                                    {material.notes && (
                                                        <p className="text-sm text-gray-500 mt-1">{material.notes}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMaterial(material.inventoryId)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedMaterials.length === 0}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Registrando...' : `Registrar ${selectedMaterials.length} Material(es)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialUsageModal;
