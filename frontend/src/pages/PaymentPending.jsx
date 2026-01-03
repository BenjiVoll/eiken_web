import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const PaymentPending = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                        <Clock className="h-10 w-10 text-yellow-600" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Pago Pendiente
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Tu pago se está procesando. Te avisaremos cuando se confirme.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/store"
                            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Volver a la Tienda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPending;
