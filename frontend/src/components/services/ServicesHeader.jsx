import React from 'react';
import { Settings, Plus } from 'lucide-react';

const ServicesHeader = ({ isManager, isAdmin, onCreate }) => (
  <div className="services-header">
    <div className="services-header-flex">
      <div>
        <h1 className="services-title-flex">
          <Settings className="h-8 w-8 mr-3 text-blue-600" />
          Servicios
        </h1>
        <p className="services-description-flex">
          Gestiona los servicios ofrecidos por Eiken Design
        </p>
      </div>
      {(isManager || isAdmin) && (
        <button
          onClick={onCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Servicio
        </button>
      )}
    </div>
  </div>
);

export default ServicesHeader;
