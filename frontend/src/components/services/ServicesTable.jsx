import React from 'react';
import { Edit, Trash2, DollarSign } from 'lucide-react';

const ServicesTable = ({ services, categories, divisions, onEdit, onDelete, getDivisionColor, formatPrice, isManager, setModalImageUrl, setShowImageModal, getImageUrl}) => (
  <div className="services-grid">
    {services.map((service) => (
      <div key={service.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center" style={{ borderBottom: '1px solid #eee' }}>
          {service.image ? (
            <img
              src={getImageUrl(service.image)}
              alt={service.name}
              className="w-full h-48 object-cover cursor-pointer"
              onClick={() => {
                setModalImageUrl(getImageUrl(service.image));
                setShowImageModal(true);
              }}
            />
          ) : (
            <span className="text-gray-400 text-sm">Sin imagen</span>
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            {isManager && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(service)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(service.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {service.description}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">División:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDivisionColor(service.division)}`}>
                {divisions.find(d => d.id === service.division)?.name || 'Sin división'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Categoría:</span>
              <span className="text-sm text-gray-900">{categories.find(c => c.id === service.category)?.name || 'Sin categoría'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-500 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Precio:
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatPrice(service.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ServicesTable;
