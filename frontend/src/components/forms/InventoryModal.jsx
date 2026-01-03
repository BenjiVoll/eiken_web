import React, { useEffect, useState } from 'react';
import {
    X,
    Box,
    Type,
    Palette,
    Tag,
    Hash,
    Ruler,
    AlertTriangle,
    Layers,
    Save
} from 'lucide-react';

const InventoryModal = ({ isOpen, onClose, onSave, editingItem }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        color: '',
        brand: '',
        model: '',
        unit: 'metros',
        quantity: 0,
        minStock: 5
    });

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setFormData({
                    name: editingItem.name,
                    type: editingItem.type,
                    color: editingItem.color,
                    brand: editingItem.brand || '',
                    model: editingItem.model || '',
                    unit: 'metros',
                    quantity: editingItem.quantity,
                    minStock: editingItem.minStock
                });
            } else {
                setFormData({
                    name: '',
                    type: '',
                    color: '',
                    brand: '',
                    model: '',
                    unit: 'metros',
                    quantity: 0,
                    minStock: 5
                });
            }
        }
    }, [isOpen, editingItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-6">
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">
                                    {editingItem ? 'Editar Material' : 'Nuevo Material'}
                                </h3>
                                <p className="mt-1 text-emerald-100 text-sm opacity-90">
                                    {editingItem
                                        ? 'Actualiza los detalles del material seleccionado.'
                                        : 'Ingresa los datos para registrar un nuevo material.'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 hover:bg-white/20 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Nombre */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre del Material *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Box className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="Ej: Vinilo Glossy Premium"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tipo / Categoría *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Layers className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 transition-all"
                                        placeholder="Ej: Adhesivo"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Color Principal *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Palette className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 transition-all"
                                        placeholder="Ej: Rojo Mate"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Marca */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Marca
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Tag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 transition-all"
                                        placeholder="Ej: 3M"
                                    />
                                </div>
                            </div>

                            {/* Modelo */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Modelo
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 transition-all"
                                        placeholder="Ej: Serie 1080"
                                    />
                                </div>
                            </div>

                            {/* Unidad */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Unidad de Medida
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Ruler className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value="Metros"
                                        readOnly
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            {/* Cantidad y Stock Mínimo Grid */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100/50">
                                {/* Cantidad */}
                                <div>
                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">
                                        Cantidad Actual *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Hash className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <input
                                            type="number"
                                            name="quantity"
                                            min="0"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-emerald-900 font-bold text-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Stock Mínimo */}
                                <div>
                                    <label className="block text-sm font-semibold text-amber-900 mb-2">
                                        Alerta Stock Bajo *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <input
                                            type="number"
                                            name="minStock"
                                            min="0"
                                            value={formData.minStock}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-900 font-bold text-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 font-medium shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                <Save className="h-5 w-5" />
                                <span>{editingItem ? 'Guardar Cambios' : 'Crear Material'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InventoryModal;
