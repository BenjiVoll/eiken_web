import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = ({ phoneNumber = "56930000000", message = "Hola! Me gustaría solicitar una cotización." }) => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
            aria-label="Contactar por WhatsApp"
        >
            {/* Tooltip / Label */}
            <span className="absolute right-16 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-100 whitespace-nowrap">
                ¿Te ayudamos con algo?
            </span>

            {/* Button Container */}
            <div className="relative">
                {/* Pulsing Aura */}
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>

                {/* Main Button */}
                <div className="relative bg-[#25D366] text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 active:scale-95">
                    <MessageCircle className="h-7 w-7 fill-current" />
                </div>
            </div>
        </a>
    );
};

export default WhatsAppButton;
