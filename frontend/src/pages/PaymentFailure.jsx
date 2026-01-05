import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentFailure = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Algo salió mal
                    </h2>

                    <p className="text-gray-600 mb-6">
                        No pudimos procesar tu pago. Puede que hayas cancelado la operación o hubo un error con la tarjeta.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/checkout"
                            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-eiken-orange-600 hover:bg-eiken-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eiken-orange-500"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Intentar nuevamente
                        </Link>

                        <Link
                            to="/store"
                            className="block text-sm font-medium text-eiken-orange-600 hover:text-eiken-orange-500"
                        >
                            Volver a la Tienda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
