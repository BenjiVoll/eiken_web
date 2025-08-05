import React from 'react';
import { FileText, Plus } from 'lucide-react';

const ProjectsHeader = ({ isManager, onCreate }) => (
  <div className="project-header-flex">
    <div>
      <h1 className="project-title-flex">
        <FileText className="h-8 w-8 mr-3 text-orange-600" />
        Proyectos
      </h1>
      <p className="project-description-flex">
        Gestiona los proyectos de la empresa
      </p>
    </div>
    {isManager && (
      <button
        onClick={onCreate}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Proyecto
      </button>
    )}
  </div>
);

export default ProjectsHeader;
