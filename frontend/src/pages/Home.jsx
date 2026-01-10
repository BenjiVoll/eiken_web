import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageModal from '@/components/forms/ImageModal';
import {
  Phone,
  Mail,
  MapPin,
  Trophy,
  Palette,
  Search,
  ArrowRight,
  CheckCircle,
  Truck
} from 'lucide-react';
import { publicAPI, settingsAPI } from '@/services/apiService';
import { showSuccessAlert, showErrorAlert } from '@/helpers/sweetAlert';
import { getErrorMessage } from '@/helpers/errorHelper';
import { getImageUrl } from '@/helpers/getImageUrl';
import QuoteModal from '@/components/forms/QuoteModal';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

  // Manejar navegación con hash (ej: /#servicios)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const sectionId = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, []);

  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalImageUrl(null);
  };
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
    service: null,
    customServiceTitle: '',
    categoryId: '',
    description: '',
    requestedDeliveryDate: '',
    selectedImages: [],
    notes: ''
  });


  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const loadCategories = async () => {
      const data = await publicAPI.services.getCategories();
      setCategories(data.data || data || []);
    };
    loadCategories();
  }, []);


  // Estado y lógica para proyectos
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [selectedProjectCategory, setSelectedProjectCategory] = useState('all');

  // Estado para el carrusel del hero
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(null);

  // Cargar número de WhatsApp desde settings
  useEffect(() => {
    const fetchWhatsapp = async () => {
      try {
        const response = await settingsAPI.get();
        if (response.data && response.data.whatsappNumber) {
          setWhatsappNumber(response.data.whatsappNumber);
        }
      } catch (error) {
        console.error('Error cargando número de WhatsApp:', error);
      }
    };
    fetchWhatsapp();
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      setError(null);
      const servicesData = await publicAPI.services.getAll();
      setServices(servicesData.data || servicesData || []);
      setLoading(false);
    };
    loadServices();
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      // Usar el endpoint de portafolio en lugar de filtrar por status
      const projectsData = await publicAPI.projects.getFeatured();
      setProjects(projectsData.data || projectsData || []);
      setProjectsLoading(false);
    };
    loadProjects();
  }, []);

  // Carrusel automático del hero
  useEffect(() => {
    const projectsWithImages = projects.filter(p => p.image);
    if (projectsWithImages.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projectsWithImages.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [projects, isPaused]);

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const timeout = setTimeout(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => observer.observe(el));

      return () => {
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timeout);
  }, []);


  // Filtrado de servicios por categoría
  const filteredServices = Array.isArray(services) ? services.filter((service) => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory || service.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // Filtrado de proyectos
  const filteredProjects = Array.isArray(projects) ? projects.filter((project) => {
    const matchesSearch = project.title?.toLowerCase().includes(projectSearchTerm.toLowerCase());
    const matchesCategory = selectedProjectCategory === 'all' || project.category?.id === selectedProjectCategory;
    // La API ya devuelve solo los completados y destacados
    return matchesSearch && matchesCategory;
  }) : [];

  // Categorías únicas para proyectos
  const getUniqueProjectCategories = () => {
    const categories = ['all'];
    const uniqueCategories = Array.isArray(projects)
      ? [...new Map(projects.filter(p => p.category).map(project => [project.category.id, project.category])).values()]
      : [];
    return [...categories, ...uniqueCategories];
  };
  const projectCategories = getUniqueProjectCategories();

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    try {
      if (!formData.service && !formData.customServiceTitle) {
        showErrorAlert('Validación', 'Debes seleccionar un servicio o especificar un servicio personalizado');
        return;
      }

      // 1. Preparar cotización sin imágenes para la creación inicial
      const { selectedImages, ...quoteData } = formData;
      const payload = {
        ...quoteData,
        service: formData.service || null,
        customServiceTitle: formData.customServiceTitle || '',
        status: 'Pendiente',
      };

      const createdQuote = await publicAPI.quotes.create(payload);

      // 2. Si la cotización se creó y hay imágenes, subirlas
      if (selectedImages && selectedImages.length > 0 && createdQuote?.data?.id) {
        try {
          const imageFormData = new FormData();
          selectedImages.forEach(file => imageFormData.append('images', file));
          await publicAPI.quotes.uploadImages(createdQuote.data.id, imageFormData);
        } catch (imageError) {
          console.error('Error uploading images but quote was created:', imageError);
        }
      }

      showSuccessAlert('¡Solicitud Recibida!', 'Nos pondremos en contacto contigo pronto.');
      resetForm();
    } catch (error) {
      console.error('Error submitting quote:', error);
      showErrorAlert('Error', getErrorMessage(error, 'No se pudo enviar la cotización. Por favor reintenta.'));
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      company: '',
      service: null,
      customServiceTitle: '',
      categoryId: '',
      description: '',
      requestedDeliveryDate: '',
      selectedImages: [],
      notes: ''
    });
    setShowQuoteModal(false);
  };

  const openQuoteModal = () => {
    setShowQuoteModal(true);
  };

  const openQuoteModalWithService = (serviceId) => {
    const selectedService = Array.isArray(services) ? services.find(s => s.id === serviceId) : null;
    let categoryId = '';
    if (selectedService) {
      if (typeof selectedService.category === 'object' && selectedService.category !== null) {
        categoryId = selectedService.category.id;
      } else if (typeof selectedService.category === 'number' || typeof selectedService.category === 'string') {
        categoryId = selectedService.category;
      }
    }
    setFormData({
      ...formData,
      service: serviceId,
      categoryId,
      customServiceTitle: ''
    });
    setShowQuoteModal(true);
  };

  // Filtrar proyectos con imagen para el carrusel
  const projectsWithImages = projects.filter(p => p.image);

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative py-20 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carrusel de fondo */}
        <div className="absolute inset-0 z-0">
          {projectsWithImages.length > 0 ? (
            <>
              {projectsWithImages.map((project, index) => (
                <div
                  key={project.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <img
                    src={getImageUrl(project.image)}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-eiken-red-50 via-white to-eiken-orange-50"></div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="animate-on-scroll fade-in-up text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Transformamos tu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                Visión
              </span>{" "}
              en Realidad
            </h1>
            <p className="animate-on-scroll fade-in-up delay-100 text-xl text-gray-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Especialistas en diseño publicitario, gráfica vehicular y competición con más de 20 años de experiencia
            </p>
            <button
              onClick={openQuoteModal}
              className="animate-on-scroll fade-in-up scale-in delay-200 bg-eiken-gradient text-white px-8 py-3 rounded-lg font-medium hover:shadow-xl transition-all hover:scale-105 flex items-center mx-auto mb-8"
            >
              Solicitar Cotización
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="animate-on-scroll scale-in delay-300 text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-400">20+</div>
              <div className="text-gray-200">Años de Experiencia</div>
            </div>
            <div className="animate-on-scroll scale-in delay-400 text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-400">500+</div>
              <div className="text-gray-200">Proyectos Realizados</div>
            </div>
            <div className="animate-on-scroll scale-in delay-500 text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-400">Avery Dennison</div>
              <div className="text-gray-200">Installer Certificado</div>
            </div>
            <div className="animate-on-scroll scale-in delay-600 text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-400">Materiales</div>
              <div className="text-gray-200">100% Certificados</div>
            </div>
          </div>

          {/* Indicadores del carrusel */}
          {projectsWithImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {projectsWithImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                    ? 'bg-orange-400 w-8'
                    : 'bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="animate-on-scroll fade-in-up text-3xl font-bold text-gray-900 mb-4">Nuestras Divisiones</h2>
            <p className="animate-on-scroll fade-in-up delay-100 text-gray-600">Especializados en tres áreas principales del diseño</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll fade-in-up delay-200 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
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

            <div className="animate-on-scroll fade-in-up delay-300 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
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

            <div className="animate-on-scroll fade-in-up delay-400 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
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
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="animate-on-scroll fade-in-up text-3xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="animate-on-scroll fade-in-up delay-100 text-gray-600">Soluciones profesionales para todas tus necesidades de diseño</p>
          </div>

          <div className="animate-on-scroll fade-in-up delay-200 flex flex-col sm:flex-row gap-4 mb-8">
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
              <button
                key="all"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === 'all'
                  ? 'bg-eiken-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category.id
                    ? 'bg-eiken-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category.name}
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
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron servicios con los filtros seleccionados.</p>
            </div>
          ) : null}

          {filteredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-2xl p-3 hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1 border border-transparent hover:border-orange-50/50"
                >
                  {/* Contenedor de imagen con efecto de zoom */}
                  <div className="relative overflow-hidden rounded-xl h-48 bg-gray-100">
                    {service.image ? (
                      <>
                        <img
                          src={getImageUrl(service.image)}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 cursor-pointer"
                          onClick={() => handleImageClick(getImageUrl(service.image))}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-lg">
                        Sin imagen
                      </div>
                    )}
                    {service.popular && (
                      <span className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 text-xs font-bold rounded-lg shadow-sm">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="pt-4 px-2 pb-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Incluye:</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5">
                          {(service.features || ["Servicio profesional", "Calidad garantizada"]).slice(0, 2).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium uppercase">Desde</p>
                          <p className="text-xl font-extrabold text-orange-600 tracking-tight">
                            ${parseFloat(service.price || 0).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => openQuoteModalWithService(service.id)}
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-orange-600 hover:shadow-orange-500/30 transition-all duration-300 transform active:scale-95"
                        >
                          Cotizar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="portafolio" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="animate-on-scroll fade-in-up text-3xl font-bold text-gray-900 mb-4">Proyectos Destacados</h2>
            <p className="animate-on-scroll fade-in-up delay-100 text-gray-600">Algunos de nuestros trabajos más representativos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex space-x-2">
              {projectCategories.map((category) => (
                <button
                  key={`project-cat-${category === 'all' ? 'all' : category.id}`}
                  onClick={() => setSelectedProjectCategory(category === 'all' ? 'all' : category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedProjectCategory === (category === 'all' ? 'all' : category.id)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category === 'all' ? 'Todos' : category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Estado de carga, error o sin proyectos */}
          {projectsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Cargando proyectos...</span>
            </div>
          ) : projectsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{projectsError}</p>
              <p className="text-gray-600">Por favor, inténtalo de nuevo más tarde.</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay proyectos disponibles en este momento.</p>
            </div>
          ) : null}

          {/* Cards de proyectos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <div key={project.id || idx} className="group bg-white rounded-2xl p-3 hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1 border border-transparent hover:border-orange-100">

                {/* Image Container */}
                <div className="relative overflow-hidden rounded-xl h-48 bg-gray-100">
                  {project.image ? (
                    <>
                      <img
                        src={getImageUrl(project.image)}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 cursor-pointer"
                        onClick={() => handleImageClick(getImageUrl(project.image))}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-lg">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mt-4 px-2 pb-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="space-y-2.5 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium uppercase tracking-wider">Cliente</span>
                      <span className="font-semibold text-gray-700 truncate max-w-[60%] text-right">{project.client?.name || project.client || 'Corporativo'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium uppercase tracking-wider">División</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{project.division?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium uppercase tracking-wider">Categoría</span>
                      <span className="text-orange-600 font-semibold">{project.category?.name || 'Varios'}</span>
                    </div>
                  </div>

                  {project.notes && (
                    <div className="mt-3 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                      <p className="text-xs text-yellow-700 italic line-clamp-2 text-center">"{project.notes}"</p>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="nosotros" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="animate-on-scroll fade-in-up text-3xl font-bold text-gray-900 mb-4">Sobre Nosotros</h2>
            <p className="animate-on-scroll fade-in-up delay-100 text-gray-600">Más de 20 años transformando ideas en realidad</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll fade-in-left">
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

            </div>
            <div className="animate-on-scroll fade-in-right space-y-6">
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
            <h2 className="animate-on-scroll fade-in-up text-3xl font-bold text-gray-900 mb-4">¿Listo para tu Proyecto?</h2>
            <p className="animate-on-scroll fade-in-up delay-100 text-gray-600">Contáctanos y hagamos realidad tu visión</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="animate-on-scroll scale-in delay-200 bg-white rounded-lg shadow-sm text-center p-6">
              <Phone className="h-8 w-8 text-eiken-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Teléfono</h3>
              <p className="text-gray-600">+54 11 1234-5678</p>
            </div>

            <div className="animate-on-scroll scale-in delay-300 bg-white rounded-lg shadow-sm text-center p-6">
              <Mail className="h-8 w-8 text-eiken-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">eiken@eikendesign.cl</p>
            </div>

            <div className="animate-on-scroll scale-in delay-400 bg-white rounded-lg shadow-sm text-center p-6">
              <MapPin className="h-8 w-8 text-eiken-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ubicación</h3>
              <p className="text-gray-600">Los Angeles, Chile</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={openQuoteModal}
              className="animate-on-scroll fade-in-up scale-in delay-500 bg-eiken-gradient text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center mx-auto"
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
                <div>
                  <img src="/Eiken design.jpg" alt="Eiken Design Logo" className="h-5 w-5" />
                </div>
                <span className="font-bold">EIKEN DESIGN</span>
              </div>
              <p className="text-gray-400 text-sm">
                Eiken Design es una empresa de diseño publicitario y gráfica vehicular con más de 20 años de experiencia transformando visiones en realidad.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dirección</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Los Angeles, Región del Biobío</li>
                <li>Chile</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">WhatsApp</h4>
              {whatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>+{whatsappNumber.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '$1 $2 $3 $4')}</span>
                </a>
              ) : (
                <span className="text-gray-500 text-sm">Cargando...</span>
              )}

              <h4 className="font-semibold mb-2 mt-6">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>eiken@eikendesign.cl</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Certificación</h4>
              <a
                href="https://graphics.averydennison.la/es_la/home/servicios/instaladores/encontrar-distribuidor-cl.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-orange-400 transition-colors group"
              >
                <div className="bg-orange-500/20 p-2 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                  <svg className="h-6 w-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Avery Dennison</p>
                  <p className="text-xs text-gray-500">Instalador Certificado</p>
                </div>
              </a>
            </div>
          </div>

          {/* Línea divisoria y copyright con disclaimer */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  &copy; {new Date().getFullYear()} Eiken Design. Todos los derechos reservados.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Todo el contenido publicado en este sitio no está permitido su uso en otros sitios web.
                </p>
              </div>
              <Link to="/login" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                Acceso Intranet
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals outside the sections */}
      <ImageModal isOpen={modalOpen} imageUrl={modalImageUrl} onClose={handleCloseModal} />
      {showQuoteModal && (
        <QuoteModal
          show={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          onSubmit={handleSubmitQuote}
          formData={formData}
          setFormData={setFormData}
          services={services}
          categories={categories}
        />
      )}
      <WhatsAppButton />
    </div>
  );
};

export default Home;
