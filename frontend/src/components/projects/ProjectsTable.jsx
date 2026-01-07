import React from 'react';
import { Edit, Trash2, User, Calendar, DollarSign, Clock, Tag, Building, Image as ImageIcon, Star } from 'lucide-react';

const ProjectsTable = ({ projects, isManager, isAdmin, isDesigner, onEdit, onDelete, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel, getImageUrl, setModalImageUrl, setShowImageModal }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {projects.map((project) => (
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
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2 flex items-center">
              {project.title}
              {project.isFeatured && (
                <Star className="ml-2 h-4 w-4 text-yellow-500 fill-current" title="Destacado en Portafolio" />
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
              {(isManager || isAdmin || isDesigner) && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEdit(project)}
                    className="text-orange-600 hover:text-orange-800 p-1"
                    title="Editar proyecto"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(project)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
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
              <span className="ml-2">{project.category?.name || 'Sin categoría'}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium text-gray-600">Prioridad:</span>
              <span className={`ml-2 font-medium ${getPriorityColor(project.priority)}`}>
                {getPriorityLabel(project.priority)}
              </span>
            </div>
            {project.budgetAmount && (
              <div className="flex items-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
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
);

export default ProjectsTable;
