import React from 'react';
import { FileText, Plus } from 'lucide-react';

const ProjectsHeader = ({ isManager, isAdmin, isDesigner, onCreate }) => {
  if (!isManager && !isAdmin && !isDesigner) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-orange-600" />
            Proyectos
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona los proyectos de la empresa
          </p>
        </div>
        {(isManager || isAdmin || isDesigner) && (
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectsHeader;
