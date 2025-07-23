import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Star,
  Phone,
  Mail,
  MapPin,
  Award,
  Truck,
  Trophy,
  Palette,
  Search,
  Heart,
  Share2,
  ArrowRight,
  CheckCircle,
  Calendar,
  Eye,
  X,
  Plus,
} from 'lucide-react';
import { publicAPI } from '../services/apiService';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    company: '',
    serviceId: '',
    customServiceTitle: '',
    serviceType: 'otro',
    description: '',
    urgency: 'medium',
    notes: ''
  });

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const servicesData = await publicAPI.services.getAll();
        setServices(servicesData.data || servicesData || []);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError('Error al cargar los servicios desde el servidor');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const filteredServices = Array.isArray(services) ? services.filter((service) => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const getUniqueCategories = () => {
    const categories = ['all'];
    const uniqueCategories = Array.isArray(services) ? 
      [...new Set(services.map(service => service.category))] : [];
    return [...categories, ...uniqueCategories];
  };

  const categories = getUniqueCategories();

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    try {
      if (!formData.serviceId && !formData.customServiceTitle) {
        alert('Debes seleccionar un servicio o especificar un servicio personalizado');
        return;
      }

      await publicAPI.quotes.create(formData);
      alert('¡Cotización enviada exitosamente! Nos pondremos en contacto contigo pronto.');
      resetForm();
    } catch (error) {
      console.error('Error al crear cotización:', error);
      
      let errorMessage = 'Error al enviar la cotización. Por favor intenta nuevamente.';
      if (error.response?.data?.details) {
        // Si hay detalles de validación, mostrar el primer error
        const validationErrors = error.response.data.details;
        if (typeof validationErrors === 'string') {
          errorMessage = validationErrors;
        } else if (validationErrors.length > 0) {
          errorMessage = validationErrors[0].message || validationErrors[0];
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      company: '',
      serviceId: '',
      customServiceTitle: '',
      serviceType: 'otro',
      description: '',
      urgency: 'medium',
      notes: ''
    });
    setShowQuoteModal(false);
  };

  const openQuoteModal = () => {
    setShowQuoteModal(true);
  };

  const openQuoteModalWithService = (serviceId) => {
    setFormData({
      ...formData,
      serviceId: serviceId,
      customServiceTitle: ''
    });
    setShowQuoteModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-eiken-red-50 via-white to-eiken-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transformamos tu{" "}
              <span className="text-transparent bg-clip-text bg-eiken-racing">
                Visión
              </span>{" "}
              en Realidad
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Especialistas en diseño publicitario, gráfica vehicular y competición con más de 20 años de experiencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={openQuoteModal}
                className="bg-eiken-gradient text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                Solicitar Cotización
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                Ver Portafolio
                <Eye className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-eiken-red-500">20+</div>
              <div className="text-gray-600">Años de Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-eiken-orange-500">500+</div>
              <div className="text-gray-600">Proyectos Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-eiken-red-600">4.9</div>
              <div className="text-gray-600">Calificación Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-eiken-orange-600">15+</div>
              <div className="text-gray-600">Premios Obtenidos</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestras Divisiones</h2>
            <p className="text-gray-600">Especializados en tres áreas principales del diseño</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-eiken-red-100 p-3 rounded-lg">
                  <Palette className="h-6 w-6 text-eiken-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Eiken Design</h3>
                  <p className="text-sm text-gray-600">Diseño Publicitario</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Identidad corporativa, diseño gráfico y soluciones publicitarias integrales para empresas.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Identidad corporativa</li>
                <li>• Diseño publicitario</li>
                <li>• Estampado textil</li>
                <li>• Material promocional</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-eiken-orange-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-eiken-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Truck Design</h3>
                  <p className="text-sm text-gray-600">Gráfica Vehicular</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Especialistas en wrap vehicular, rotulado de flotas y gráfica comercial para vehículos.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Wrap vehicular completo</li>
                <li>• Rotulado de flotas</li>
                <li>• Gráfica comercial</li>
                <li>• Vehículos especiales</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Racing Design</h3>
                  <p className="text-sm text-gray-600">Competición</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Gráfica especializada para vehículos de competición con estándares internacionales.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Autos de competición</li>
                <li>• Rally nacional/internacional</li>
                <li>• Cascos y equipamiento</li>
                <li>• Homologación FIA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-gray-600">Soluciones profesionales para todas tus necesidades de diseño</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-eiken-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category === 'all' ? 'Todos' : category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando servicios...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600">Por favor, inténtalo de nuevo más tarde.</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay servicios disponibles en este momento.</p>
            </div>
          ) : null}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow group">
                <div className="p-6">
                  <div className="relative mb-4">
                    <img
                      src={service.image || "/placeholder.svg?height=300&width=400"}
                      alt={service.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {service.popular && (
                      <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs rounded">
                        Popular
                      </span>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button className="h-8 w-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="h-8 w-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                      {service.division}
                    </span>
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{service.rating || 4.5}</span>
                        <span className="text-xs text-gray-500">(50+ reseñas)</span>
                      </div>
                      <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded">
                        {service.duration || "Consultar"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Incluye:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {(service.features || ["Servicio profesional", "Calidad garantizada"]).slice(0, 2).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          ${parseFloat(service.price || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Desde</div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openQuoteModalWithService(service.id)}
                          className="border border-gray-300 px-3 py-1 text-sm rounded hover:bg-gray-50"
                        >
                          Cotizar
                        </button>
                        <button className="bg-eiken-gradient text-white px-3 py-1 text-sm rounded hover:shadow-lg transition-shadow flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="portafolio" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proyectos Destacados</h2>
            <p className="text-gray-600">Algunos de nuestros trabajos más representativos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Proyecto Destacado 1"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded mb-2">
                    Truck Design
                  </span>
                  <h3 className="text-xl font-bold">Proyecto Flota Empresarial</h3>
                  <p className="text-sm opacity-90">Cliente Corporativo</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Diseño corporativo unificado para flota de vehículos comerciales</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      2024
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      Flota Comercial
                    </div>
                  </div>
                  <button className="border border-gray-300 px-3 py-1 text-sm rounded hover:bg-gray-50">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Proyecto Destacado 2"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded mb-2">
                    Racing Design
                  </span>
                  <h3 className="text-xl font-bold">Competición Automovilística</h3>
                  <p className="text-sm opacity-90">Equipo Racing</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Gráfica especializada para vehículos de competición</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      2024
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      Automovilismo
                    </div>
                  </div>
                  <button className="border border-gray-300 px-3 py-1 text-sm rounded hover:bg-gray-50">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center mx-auto">
              Ver Todos los Proyectos
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section id="nosotros" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sobre Nosotros</h2>
            <p className="text-gray-600">Más de 20 años transformando ideas en realidad</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nuestra Historia</h3>
              <p className="text-gray-600 mb-6">
                Desde nuestros inicios en 2004, Eiken Design se ha establecido como líder en el diseño publicitario 
                y gráfica vehicular en Argentina. Comenzamos como un pequeño estudio de diseño y hemos crecido hasta 
                convertirnos en una empresa reconocida en tres divisiones especializadas.
              </p>
              <p className="text-gray-600 mb-6">
                Nuestro compromiso con la calidad, la innovación y la satisfacción del cliente nos ha permitido 
                trabajar con empresas líderes y equipos de competición de primer nivel.
              </p>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-eiken-red-500">500+</div>
                  <div className="text-sm text-gray-600">Clientes Satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-eiken-orange-500">20+</div>
                  <div className="text-sm text-gray-600">Años de Experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-eiken-red-600">15+</div>
                  <div className="text-sm text-gray-600">Premios Obtenidos</div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Misión</h4>
                <p className="text-gray-600 text-sm">
                  Transformar las ideas de nuestros clientes en soluciones visuales impactantes que comuniquen 
                  efectivamente su mensaje y fortalezcan su identidad de marca.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Visión</h4>
                <p className="text-gray-600 text-sm">
                  Ser la empresa líder en diseño publicitario y gráfica vehicular en Latinoamérica, reconocida 
                  por nuestra innovación, calidad y excelencia en el servicio.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Valores</h4>
                <p className="text-gray-600 text-sm">
                  Creatividad, calidad, innovación, compromiso con el cliente y responsabilidad social son los 
                  pilares que guían cada uno de nuestros proyectos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Listo para tu Proyecto?</h2>
            <p className="text-gray-600">Contáctanos y hagamos realidad tu visión</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm text-center p-6">
              <Phone className="h-8 w-8 text-eiken-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Teléfono</h3>
              <p className="text-gray-600">+54 11 1234-5678</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm text-center p-6">
              <Mail className="h-8 w-8 text-eiken-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">eiken@eikendesign.cl</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm text-center p-6">
              <MapPin className="h-8 w-8 text-eiken-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ubicación</h3>
              <p className="text-gray-600">Los Angeles, Chile</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={openQuoteModal}
              className="bg-eiken-gradient text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center mx-auto"
            >
              Solicitar Cotización Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-eiken-gradient p-2 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">EIKEN DESIGN</span>
              </div>
              <p className="text-gray-400 text-sm">Transformando visiones en realidad desde hace más de 20 años.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Wrap Vehicular</li>
                <li>Gráfica de Competición</li>
                <li>Identidad Corporativa</li>
                <li>Rotulado de Flota</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Divisiones</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Eiken Design</li>
                <li>Truck Design</li>
                <li>Racing Design</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>+54 11 1234-5678</li>
                <li>eiken@eikendesign.cl</li>
                <li>Los Angeles, Chile</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Eiken Design. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal para solicitar cotización */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.serviceId ? 
                  `Cotizar: ${Array.isArray(services) ? services.find(s => s.id === formData.serviceId)?.name || 'Servicio' : 'Servicio'}` : 
                  'Solicitar Cotización'
                }
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información del Cliente */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Tus Datos</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu Email *
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                    placeholder="+56 9 xxxx xxxx"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                  />
                </div>

                {/* Información del Servicio */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-2 mt-4">¿Qué Necesitas?</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Servicio *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                    required
                  >
                    <option value="otro">Otro</option>
                    <option value="identidad-corporativa">Identidad Corporativa</option>
                    <option value="grafica-competicion">Gráfica de Competición</option>
                    <option value="wrap-vehicular">Wrap Vehicular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Qué tan urgente es?
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                  >
                    <option value="low">No hay apuro</option>
                    <option value="medium">En un par de semanas</option>
                    <option value="high">Lo antes posible</option>
                    <option value="urgent">¡Es urgente!</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio de Nuestro Catálogo
                    {formData.serviceId && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Preseleccionado
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value, customServiceTitle: e.target.value ? '' : formData.customServiceTitle })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                  >
                    <option value="">Seleccionar servicio</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.price?.toLocaleString('es-CL')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    O Descríbenos tu Servicio
                  </label>
                  <input
                    type="text"
                    value={formData.customServiceTitle}
                    onChange={(e) => setFormData({ ...formData, customServiceTitle: e.target.value, serviceId: e.target.value ? '' : formData.serviceId })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                    placeholder="Ej: Diseño de logos, rotulado de vehículo..."
                    disabled={!!formData.serviceId}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.serviceId ? 'Deselecciona el servicio del catálogo para describir tu propio servicio' : 'O selecciona un servicio de nuestro catálogo arriba'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuéntanos más sobre tu proyecto *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                    rows="4"
                    placeholder="Describe tu proyecto, qué necesitas, colores preferidos, tamaño del vehículo si aplica, etc."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información Adicional
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-eiken-red-500"
                    rows="2"
                    placeholder="Referencias, inspiraciones, presupuesto aproximado, fechas importantes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-eiken-gradient text-white rounded-md hover:shadow-lg transition-shadow"
                >
                  Enviar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
