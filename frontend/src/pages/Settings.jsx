import React, { useState, useEffect } from 'react';

import { settingsAPI } from '../services/apiService';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import { Save, MapPin, Clock, Phone } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        pickupAddress: '',
        pickupCity: '',
        pickupHours: '',
        whatsappNumber: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsAPI.get();
            if (response.data) {
                setFormData({
                    pickupAddress: response.data.pickupAddress,
                    pickupCity: response.data.pickupCity,
                    pickupHours: response.data.pickupHours,
                    whatsappNumber: response.data.whatsappNumber || ''
                });
            }
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'No se pudo cargar la configuración');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await settingsAPI.update(formData);
            showSuccessAlert('Guardado', 'La configuración se actualizó correctamente');
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'No se pudo guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración de la Tienda</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Datos de Retiro en Tienda
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Esta información se mostrará a los clientes en el checkout cuando seleccionen "Retiro en Taller".
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección de Retiro
                            </label>
                            <input
                                type="text"
                                name="pickupAddress"
                                value={formData.pickupAddress}
                                onChange={handleChange}
                                placeholder="Ej: Calle 2 Sur 1061"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad / Región
                            </label>
                            <input
                                type="text"
                                name="pickupCity"
                                value={formData.pickupCity}
                                onChange={handleChange}
                                placeholder="Ej: Talca, Región del Maule"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Horario de Atención
                            </label>
                            <input
                                type="text"
                                name="pickupHours"
                                value={formData.pickupHours}
                                onChange={handleChange}
                                placeholder="Ej: Lun-Vie 09:00 - 18:00"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Indica los días y horas en que los clientes pueden retirar sus pedidos.
                            </p>
                        </div>

                        <div className="md:col-span-2 pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Número de WhatsApp
                            </label>
                            <input
                                type="text"
                                name="whatsappNumber"
                                value={formData.whatsappNumber}
                                onChange={handleChange}
                                placeholder="Ej: 56912345678"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Número para el botón flotante de WhatsApp (formato internacional sin "+", ej: 569...)
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
