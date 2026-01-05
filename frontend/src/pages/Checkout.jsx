import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { showSuccessAlert, showErrorAlert } from '@/helpers/sweetAlert';
import { getImageUrl } from '@/helpers/getImageUrl';
import { settingsAPI } from '@/services/apiService';

import { MapPin } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [pickupDetails, setPickupDetails] = useState({
        address: 'Cargando...',
        city: '',
        hours: ''
    });
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});

    // Cargar configuración de la tienda
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsAPI.get();
                if (response.data) {
                    setPickupDetails({
                        address: response.data.pickupAddress,
                        city: response.data.pickupCity,
                        hours: response.data.pickupHours
                    });
                }
            } catch (error) {
                console.error("Error fetching store settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.clientName.trim()) {
            newErrors.clientName = 'El nombre es obligatorio';
        }
        if (!formData.clientEmail.trim()) {
            newErrors.clientEmail = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
            newErrors.clientEmail = 'Email inválido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (cart.length === 0) {
            showErrorAlert('Error', 'El carrito está vacío');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                notes: formData.notes,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                }))
            };

            const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';
            const response = await axios.post(`${baseUrl}/payments/create-preference`, orderData);

            const initPoint = response.data.data.initPoint || response.data.data.init_point;

            if (initPoint) {
                window.location.href = initPoint;
            } else {
                throw new Error("No se recibió la URL de pago");
            }
        } catch (error) {
            console.error('Error creating order:', error);
            showErrorAlert('Error', error.response?.data?.message || 'No se pudo crear la orden');
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
                    <button
                        onClick={() => navigate('/store')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Ir a la Tienda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-6">Información de Contacto</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.clientName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    {errors.clientName && (
                                        <p className="text-red-600 text-sm mt-1">{errors.clientName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="clientEmail"
                                        value={formData.clientEmail}
                                        onChange={handleChange}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.clientEmail ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    {errors.clientEmail && (
                                        <p className="text-red-600 text-sm mt-1">{errors.clientEmail}</p>
                                    )}
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Lugar de retiro</h3>
                                    <p className="text-sm text-gray-500 mb-3">Hay 1 sucursal con existencias cerca de ti</p>

                                    <div className="border-2 border-indigo-600 bg-indigo-50 rounded-lg p-4 flex justify-between items-start cursor-default">
                                        <div className="flex gap-3">
                                            <div className="mt-0.5">
                                                <MapPin className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{pickupDetails.address}</h4>
                                                <p className="text-sm text-gray-600">{pickupDetails.city}</p>
                                                <p className="text-xs text-gray-500 mt-1">{pickupDetails.hours}</p>
                                            </div>
                                        </div>
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase">
                                            GRATIS
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas (opcional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        disabled={loading}
                                        placeholder="Instrucciones especiales, preferencias de entrega, etc."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Redirigiendo a MercadoPago...</span>
                                        </>
                                    ) : (
                                        'Pagar con MercadoPago'
                                    )}
                                </button>
                            </form>


                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">Resumen de la Orden</h2>
                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                            <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{formatPrice(getCartTotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
