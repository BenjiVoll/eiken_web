import React, { useState, useEffect } from 'react';
import DivisionModal from '../components/forms/DivisionModal';
import { divisionsAPI } from '../services/apiService';
import { Plus, Edit, Trash2, Search, Settings } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '../helpers/sweetAlert';

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    try {
      const response = await divisionsAPI.getAll();
      setDivisions(response.data || []);
    } catch {
      setDivisions([]);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmAlert('¿Estás seguro de que quieres eliminar esta división?', 'Esta acción no se puede deshacer');
    if (result.isConfirmed) {
      try {
        await divisionsAPI.delete(id);
        await loadDivisions();
        showSuccessAlert('¡Eliminado!', 'La división ha sido eliminada correctamente');
      } catch {
        showErrorAlert('Error', 'No se pudo eliminar la división');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="h-7 w-7 mr-2 text-green-600" /> Divisiones
        </h1>
        <button
          onClick={() => { setShowDivisionModal(true); setEditingDivision(null); }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Nueva División
        </button>
      </div>
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar divisiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {divisions.filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(division => (
              <tr key={division.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{division.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => { setEditingDivision(division); setShowDivisionModal(true); }}
                    className="text-green-600 hover:text-green-800 mr-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(division.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {divisions.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay divisiones registradas.</div>
        )}
      </div>
      <DivisionModal
        isOpen={showDivisionModal}
        onClose={() => { setShowDivisionModal(false); setEditingDivision(null); }}
        onSave={async (data) => {
          setModalLoading(true);
          if (editingDivision) {
            await divisionsAPI.update(editingDivision.id, data);
          } else {
            await divisionsAPI.create(data);
          }
          setShowDivisionModal(false);
          setEditingDivision(null);
          setModalLoading(false);
          loadDivisions();
        }}
        division={editingDivision}
        loading={modalLoading}
      />
    </div>
  );
};

export default Divisions;
