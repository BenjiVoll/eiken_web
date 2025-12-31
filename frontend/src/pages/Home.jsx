import React, { useState, useEffect } from 'react';
import ImageModal from '@/components/forms/ImageModal';
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  Trophy,
  Palette,
  Search,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { publicAPI } from '@/services/apiService';
import { showSuccessAlert, showErrorAlert } from '@/helpers/sweetAlert';
import { getImageUrl } from '@/helpers/getImageUrl';
import QuoteModal from '@/components/forms/QuoteModal';

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
      const projectsData = await publicAPI.projects.getByStatus("Completado");
      setProjects(projectsData.data || projectsData || []);
      setProjectsLoading(false);
    };
    loadProjects();
  }, []);

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    // Esperar un momento para asegurar que el DOM esté completamente listo
    const timeout = setTimeout(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px' // Activa cuando está a 100px del viewport
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Agregar clase animated para activar la animación (solo la primera vez)
            entry.target.classList.add('animated');
            // Dejar de observar una vez que ya animó (one-shot)
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observar todos los elementos con la clase .animate-on-scroll
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => observer.observe(el));

      // Cleanup
      return () => {
        observer.disconnect();
      };
    }, 100); // Pequeño delay de 100ms

    return () => clearTimeout(timeout);
  }, []); // Sin dependencias - solo se ejecuta una vez al montar


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
    const isCompleted = project.status === 'Completado';
    return matchesSearch && matchesCategory && isCompleted;
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
          // Asumiendo que publicAPI.quotes.uploadImages espera un FormData
          const imageFormData = new FormData();
          selectedImages.forEach(file => imageFormData.append('images', file));
          await publicAPI.quotes.uploadImages(createdQuote.data.id, imageFormData);
        } catch (imageError) {
          console.error('Error uploading images but quote was created:', imageError);
          // Opcional: Notificar que las imágenes fallaron pero el resto se guardó
        }
      }

      showSuccessAlert('¡Solicitud Recibida!', 'Nos pondremos en contacto contigo pronto.');
      resetForm();
    } catch (error) {
      console.error('Error submitting quote:', error);
      showErrorAlert('Error', 'No se pudo enviar la cotización. Por favor reintenta.');
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

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-eiken-red-50 via-white to-eiken-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="animate-on-scroll fade-in-up text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transformamos tu{" "}
              <span className="text-transparent bg-clip-text bg-eiken-racing">
                Visión
              </span>{" "}
              en Realidad
            </h1>
            <p className="animate-on-scroll fade-in-up delay-100 text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Especialistas en diseño publicitario, gráfica vehicular y competición con más de 20 años de experiencia
            </p>
            <button
              onClick={openQuoteModal}
              className="animate-on-scroll fade-in-up scale-in delay-200 bg-eiken-gradient text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center mx-auto mb-8"
            >
              Solicitar Cotización
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="animate-on-scroll scale-in delay-300 text-center">
              <div className="text-3xl font-bold text-eiken-orange-500">20+</div>
              <div className="text-gray-600">Años de Experiencia</div>
            </div>
            <div className="animate-on-scroll scale-in delay-400 text-center">
              <div className="text-3xl font-bold text-eiken-orange-500">500+</div>
              <div className="text-gray-600">Proyectos Realizados</div>
            </div>
            <div className="animate-on-scroll scale-in delay-500 text-center">
              <div className="text-3xl font-bold text-eiken-orange-500">Avery Dennison</div>
              <div className="text-gray-600">Installer Certificado</div>
            </div>
            <div className="animate-on-scroll scale-in delay-600 text-center">
              <div className="text-3xl font-bold text-eiken-orange-500">Materiales</div>
              <div className="text-gray-600">100% Premium</div>
            </div>
          </div>
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
                <li>• Homologación FIA</li>
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
                <div key={service.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow group">
                  <div className="p-6">
                    <div className="relative mb-4">
                      {service.image ? (
                        <img
                          src={getImageUrl(service.image)}
                          alt={service.name}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer"
                          onClick={() => handleImageClick(getImageUrl(service.image))}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-lg">
                          Sin imagen
                        </div>
                      )}
                      {service.popular && (
                        <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs rounded">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                    </div>

                    <div className="space-y-4">


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
                        </div>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              {projectCategories.map((category) => (
                <button
                  key={`project-cat-${category === 'all' ? 'all' : category.id}`}
                  onClick={() => setSelectedProjectCategory(category === 'all' ? 'all' : category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedProjectCategory === (category === 'all' ? 'all' : category.id)
                    ? 'bg-eiken-orange-500 text-white'
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
              <div key={project.id || idx} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow group">
                <div className="p-6">
                  <div className="relative mb-4">
                    {project.image ? (
                      <img
                        src={getImageUrl(project.image)}
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => handleImageClick(getImageUrl(project.image))}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-lg">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  {/* Modal de imagen ampliada */}
                  <ImageModal isOpen={modalOpen} imageUrl={modalImageUrl} onClose={handleCloseModal} />
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Cliente:</span>
                      <span className="ml-2 truncate">{project.client?.name || project.client || 'Corporativo'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">División:</span>
                      <span className="ml-2">{project.division?.name || ''}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Categoría:</span>
                      <span className="ml-2">{project.category?.name || ''}</span>
                    </div>
                  </div>
                  {project.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic line-clamp-2">{project.notes}</p>
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
                <li>Eiken Truck Design</li>
                <li>Eiken Racing Design</li>
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

      <QuoteModal
        show={showQuoteModal}
        onClose={resetForm}
        onSubmit={handleSubmitQuote}
        formData={formData}
        setFormData={setFormData}
        services={services}
        categories={categories}
      />
    </div>
  );
};

export default Home;
