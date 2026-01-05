import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import axios from 'axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();
    const [confirming, setConfirming] = useState(true);
    const [error, setError] = useState(null);

    const paymentId = searchParams.get('payment_id');
    const externalReference = searchParams.get('external_reference');
    const status = searchParams.get('status');

    const confirmedRef = React.useRef(false);

    useEffect(() => {
        const confirmOrder = async () => {
            // Evitar múltiples llamadas
            if (confirmedRef.current) return;
            confirmedRef.current = true;

            try {
                // Limpiar el carrito
                clearCart();

                // Si tenemos external_reference (order ID), confirmar la orden
                if (externalReference) {
                    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

                    const response = await axios.post(`${baseUrl}/orders/${externalReference}/confirm`);

                } else {
                    console.warn('No se recibió external_reference - la orden no se confirmará automáticamente');
                }
            } catch (err) {
                console.error('Error confirming order:', err);
                setError('No se pudo confirmar la orden, pero el pago fue exitoso');
            } finally {
                setConfirming(false);
            }
        };

        confirmOrder();
    }, []);

    if (confirming) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Confirmando tu orden...
                        </h2>
                        <p className="text-gray-600">
                            Por favor espera un momento
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        ¡Pago Exitoso!
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Tu compra ha sido procesada correctamente.
                        {paymentId && <span className="block mt-2 text-sm text-gray-500">ID de pago: {paymentId}</span>}
                        {externalReference && <span className="block mt-1 text-sm text-gray-500">Orden #{externalReference}</span>}
                    </p>

                    {error && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="text-left bg-gray-50 p-4 rounded-md mb-8">
                        <p className="text-sm text-gray-600 mb-1">
                            Hemos enviado un correo de confirmación con los detalles de tu pedido.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to="/store"
                            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-eiken-orange-600 hover:bg-eiken-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eiken-orange-500"
                        >
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            Volver a la Tienda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
