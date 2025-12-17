import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import ImageModal from '../components/forms/ImageModal';
import { projectsAPI, clientsAPI } from '../services/apiService';
import { FileText } from 'lucide-react';
import ProjectsHeader from '../components/projects/ProjectsHeader';
import ProjectsSearchBar from '../components/projects/ProjectsSearchBar';
import ProjectsTable from '../components/projects/ProjectsTable';
import ProjectModal from '../components/forms/ProjectModal';
import { getImageUrl } from '../helpers/getImageUrl';
import { showSuccessAlert, showErrorAlert, deleteDataAlert } from '../helpers/sweetAlert';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const { isManager, isAdmin } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsResponse, clientsResponse] = await Promise.all([
        projectsAPI.getAll(),
        clientsAPI.getAll()
      ]);
      setProjects(Array.isArray(projectsResponse.data) ? projectsResponse.data : []);
      if (Array.isArray(clientsResponse)) {
        setClients(clientsResponse);
      } else {
        setClients([]);
      }
      if (!Array.isArray(clientsResponse) || clientsResponse.length === 0) {
        console.warn('No se encontraron clientes.');
      }
    } catch {
      setClients([]);
    }
    setLoading(false);
  }

  // Filtro de proyectos
  const filteredProjects = Array.isArray(projects)
    ? projects.filter(project =>
      (project.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (String(project.division || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : [];

  // Funciones mínimas para modularización
  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (project) => {
    const confirm = await deleteDataAlert('¿Eliminar proyecto?', 'Esta acción no se puede deshacer');
    if (!confirm.isConfirmed) return;
    try {
      await projectsAPI.delete(project.id);
      showSuccessAlert('Proyecto eliminado');
      loadData();
    } catch {
      showErrorAlert('Error', 'No se pudo eliminar el proyecto');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Proceso';
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };


  const handleSaveProject = async (formData) => {
    try {
      let response;
      let imageWasUploaded = false;
      if (editingProject) {
        response = await projectsAPI.update(editingProject.id, formData);

        imageWasUploaded = false;
      } else {
        response = await projectsAPI.create(formData);
        imageWasUploaded = false;
      }
      setIsModalOpen(false);
      setEditingProject(null);
      await loadData();

      if (!imageWasUploaded) {
        showSuccessAlert(editingProject ? 'Proyecto actualizado' : 'Proyecto creado');
      }
      return response.data || response;
    } catch {
      showErrorAlert('Error', 'No se pudo guardar el proyecto');
      return null;
    }
  };
  const handleProjectImageUpload = async (projectId, imageFile) => {
    if (!projectId || !imageFile) return;
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      await projectsAPI.uploadImage(projectId, formData);

      loadData();
    } catch {
      showErrorAlert('Error', 'No se pudo subir la imagen');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProjectsHeader isManager={isManager} isAdmin={isAdmin} onCreate={handleCreateProject} />
      <ProjectsSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {loading ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Cargando proyectos...</h3>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con un término de búsqueda diferente' : 'Comienza creando un nuevo proyecto'}
          </p>
          {!searchTerm && (isManager || isAdmin) && (
            <div className="mt-6">
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Nuevo Proyecto
              </button>
            </div>
          )}
        </div>
      ) : (
        <ProjectsTable
          projects={filteredProjects}
          isManager={isManager}
          isAdmin={isAdmin}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          getPriorityColor={getPriorityColor}
          getPriorityLabel={getPriorityLabel}
          getImageUrl={getImageUrl}
          setModalImageUrl={setModalImageUrl}
          setShowImageModal={setShowImageModal}
        />
      )}
      <ImageModal
        isOpen={showImageModal}
        imageUrl={modalImageUrl}
        onClose={() => setShowImageModal(false)}
      />
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        onImageUpload={handleProjectImageUpload}
        project={editingProject}
        clients={clients}
        noClientsMessage={clients.length === 0 ? 'No hay clientes disponibles. Por favor, crea un cliente primero.' : undefined}
      />
    </div>
  );
};

export default Projects;
