import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAPI } from '../services/apiService';
import { CheckCircle, XCircle, Loader, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const QuoteAccept = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [quote, setQuote] = useState(null);

    const effectRan = React.useRef(false);

    useEffect(() => {
        const acceptQuote = async () => {
            try {
                const response = await publicAPI.quotes.accept(token);
                setStatus('success');
                setMessage(response.message || 'Presupuesto aceptado correctamente.');
                setQuote(response.data?.quote || response.data);

                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#34d399', '#059669', '#FF6600']
                });
            } catch (error) {
                console.error("Error aceptando presupuesto:", error);

                // Si el error es un 400/404 pero es porque ya estaba aprobado (manejo adicional por robustez)
                if (error.response && error.response.status === 400 && error.response.data.message.includes("aprobada")) {
                    setStatus('success');
                    setMessage(error.response.data.message);
                    return;
                }

                setStatus('error');
                setMessage(error.response?.data?.message || 'Hubo un error al procesar tu solicitud. El enlace puede haber expirado.');
            }
        };

        if (token && !effectRan.current) {
            effectRan.current = true;
            acceptQuote();
        } else if (!token) {
            setStatus('error');
            setMessage('Token no proporcionado.');
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transition-all duration-500 transform hover:scale-105">

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Procesando Aceptación...</h2>
                        <p className="text-gray-500 mt-2">Por favor espera un momento.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <div className="bg-green-100 p-4 rounded-full mb-6">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Presupuesto Aceptado!</h1>

                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        <div className="bg-green-50 rounded-lg p-4 w-full mb-6 border border-green-100">
                            <p className="text-sm text-green-800 font-medium">
                                Hemos notificado al equipo de Eiken Design.
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                Pronto nos pondremos en contacto contigo para coordinar el inicio del proyecto.
                            </p>
                        </div>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors w-full font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Inicio
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-shake">
                        <div className="bg-red-100 p-4 rounded-full mb-6">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
                        <p className="text-red-600 mb-6 font-medium">
                            {message}
                        </p>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors w-full font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Inicio
                        </Link>
                    </div>
                )}

            </div>

            <div className="mt-8 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Eiken Design.
            </div>
        </div>
    );
};

export default QuoteAccept;
