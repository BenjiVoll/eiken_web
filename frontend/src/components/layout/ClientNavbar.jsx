import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Palette, Menu, X } from 'lucide-react';

const ClientNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);

    // Si estamos en la home, solo hacer scroll
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    } else {
      // Si estamos en otra página, navegar a home con hash
      navigate(`/#${sectionId}`);
      // Esperar a que se cargue la home y luego hacer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 flex-1">
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

          <div className="hidden md:flex items-center space-x-4 justify-end flex-1">
            <Link
              to="/store"
              className="bg-eiken-gradient text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Ir a Tienda</span>
            </Link>

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
              <Link
                to="/store"
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-eiken-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tienda
              </Link>
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


              <div className="px-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => scrollToSection('contacto')}
                  className="w-full bg-eiken-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all text-center"
                >
                  Cotizar Proyecto
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default ClientNavbar;
