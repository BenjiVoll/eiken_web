import { useState, useEffect } from 'react';
import ImageModal from '../components/forms/ImageModal';
import { projectsAPI, clientsAPI } from '../services/apiService';
import { FileText, Search, Plus, Edit, Trash2, User, Calendar, DollarSign, Clock, Tag, Building } from 'lucide-react';
import ProjectModal from '../components/forms/ProjectModal';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import { getImageUrl } from '../helpers/getImageUrl';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, clientsResponse] = await Promise.all([
        projectsAPI.getAll(),
        clientsAPI.getAll()
      ]);
      
      setProjects(Array.isArray(projectsResponse.data) ? projectsResponse.data : []);
      setClients(Array.isArray(clientsResponse) ? clientsResponse : []);
    } catch (error) {
      console.error('Error loading data:', error);
      showErrorAlert('Error', 'No se pudieron cargar los datos');
      setProjects([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (project) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      try {
        await projectsAPI.delete(project.id);
        showSuccessAlert('¡Eliminado!', 'El proyecto ha sido eliminado correctamente');
        loadData();
      } catch (error) {
        console.error('Error deleting project:', error);
        showErrorAlert('Error', 'No se pudo eliminar el proyecto');
      }
    }
  };

  const handleSaveProject = async (formData) => {
    try {
      setModalLoading(true);
      let savedProject;
      let payload = { ...formData };
      if (editingProject) {
        // En actualización, enviar categoryId
        const response = await projectsAPI.update(editingProject.id, payload);
        savedProject = response?.data;
        showSuccessAlert('¡Actualizado!', 'El proyecto ha sido actualizado correctamente');
      } else {
        // En creación, convertir categoryId a projectType
        if (payload.categoryId) {
          payload.projectType = payload.categoryId;
          delete payload.categoryId;
        }
        const response = await projectsAPI.create(payload);
        savedProject = response?.data;
        showSuccessAlert('¡Creado!', 'El proyecto ha sido creado correctamente');
      }
      setIsModalOpen(false);
      loadData();
      return savedProject;
    } catch (error) {
      console.error('Error saving project:', error);
      showErrorAlert('Error', error.response?.data?.message || 'No se pudo guardar el proyecto');
      return undefined;
    } finally {
      setModalLoading(false);
    }
  };

  // Subir imagen de proyecto y refrescar lista (igual que services)
  const handleProjectImageUpload = async (projectId, imageFile) => {
    if (!imageFile || !projectId) {
      console.log('No hay imagen o projectId para subir');
      return;
    }
    try {
      const formDataImg = new FormData();
      formDataImg.append('image', imageFile);
      console.log('FormData para imagen:', formDataImg.get('image'));
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/projects/${projectId}/image`, {
        method: 'POST',
        body: formDataImg,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await response.json();
      console.log('Respuesta backend subida imagen:', result);
      await loadData();
      showSuccessAlert('¡Imagen subida!', 'La imagen del proyecto se ha subido correctamente');
    } catch (error) {
      console.error('Error al subir imagen de proyecto:', error);
      showErrorAlert('Error', 'No se pudo subir la imagen del proyecto');
    }
  };

  // Proteger el filtro asegurando que projects sea un array
  const filteredProjects = Array.isArray(projects) ? projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.division?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Proceso';
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-orange-600" />
              Proyectos
            </h1>
            <p className="mt-2 text-gray-600">Gestiona los proyectos de la empresa</p>
          </div>
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar proyectos por título, división o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con un término de búsqueda diferente' : 'Comienza creando un nuevo proyecto'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center" style={{ borderBottom: '1px solid #eee' }}>
                {project.image ? (
                  <img
                    src={getImageUrl(project.image)}
                    alt={project.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => {
                      setModalImageUrl(getImageUrl(project.image));
                      setShowImageModal(true);
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Sin imagen</span>
                )}
              </div>
              <ImageModal
                isOpen={showImageModal}
                imageUrl={modalImageUrl}
                onClose={() => setShowImageModal(false)}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Editar proyecto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">Cliente:</span>
                    <span className="ml-2 truncate">{project.client?.name || 'N/A'}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">División:</span>
                    <span className="ml-2">{project.division?.name || project.division}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Tag className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">Tipo:</span>
                    <span className="ml-2">{project.category?.name || project.projectType}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-600">Prioridad:</span>
                    <span className={`ml-2 font-medium ${getPriorityColor(project.priority)}`}>
                      {getPriorityLabel(project.priority)}
                    </span>
                  </div>

                  {project.budgetAmount && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Presupuesto:</span>
                      <span className="ml-2 font-bold text-green-600">
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP'
                        }).format(project.budgetAmount)}
                      </span>
                    </div>
                  )}

                  {project.createdAt && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Creado:</span>
                      <span className="ml-2">
                        {new Date(project.createdAt).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  )}
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
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        onImageUpload={handleProjectImageUpload}
        project={editingProject}
        loading={modalLoading}
        clients={clients}
      />
    </div>
  );
};

export default Projects;
