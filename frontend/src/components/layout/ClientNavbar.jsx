import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Menu, X, ShoppingCart, Phone } from 'lucide-react';

const ClientNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Eiken Design Logo" 
                className="h-10 w-auto"
              />
              <div className="bg-eiken-gradient p-2 rounded-lg hidden">
                <Palette className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EIKEN DESIGN</h1>
              <p className="text-xs text-gray-600">Diseño Publicitario & Gráfica Vehicular</p>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('servicios')}
              className="text-gray-600 hover:text-eiken-red-500 font-medium transition-colors"
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection('portafolio')}
              className="text-gray-600 hover:text-eiken-red-500 font-medium transition-colors"
            >
              Portafolio
            </button>
            <button
              onClick={() => scrollToSection('nosotros')}
              className="text-gray-600 hover:text-eiken-red-500 font-medium transition-colors"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="text-gray-600 hover:text-eiken-red-500 font-medium transition-colors"
            >
              Contacto
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/intranet" 
              className="text-gray-600 hover:text-eiken-red-500 font-medium transition-colors"
            >
              Intranet
            </Link>
            <button className="relative bg-eiken-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrito
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-eiken-red-500 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-4">
              <button
                onClick={() => scrollToSection('servicios')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-eiken-red-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Servicios
              </button>
              <button
                onClick={() => scrollToSection('portafolio')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-eiken-red-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Portafolio
              </button>
              <button
                onClick={() => scrollToSection('nosotros')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-eiken-red-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Nosotros
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-eiken-red-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Contacto
              </button>
              
              <Link
                to="/intranet"
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-eiken-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Intranet
              </Link>
              
              <div className="space-y-2 px-4 pt-4 border-t border-gray-200">
                <button className="w-full border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center">
                  Cotizar Proyecto
                </button>
                <button className="w-full bg-eiken-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Carrito
                </button>
                <a
                  href="tel:+541112345678"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar Ahora
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default ClientNavbar;
