import React, { useState, useEffect } from 'react';
import CategoryModal from '../components/forms/CategoryModal';
import { categoriesAPI } from '../services/apiService';
import { Plus, Edit, Trash2, Search, Settings } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '../helpers/sweetAlert';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch {
      setCategories([]);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmAlert('¿Estás seguro de que quieres eliminar esta categoría?', 'Esta acción no se puede deshacer');
    if (result.isConfirmed) {
      try {
        await categoriesAPI.delete(id);
        await loadCategories();
        showSuccessAlert('¡Eliminado!', 'La categoría ha sido eliminada correctamente');
      } catch {
        showErrorAlert('Error', 'No se pudo eliminar la categoría');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="h-7 w-7 mr-2 text-blue-600" /> Categorías
        </h1>
        <button
          onClick={() => { setShowCategoryModal(true); setEditingCategory(null); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Nueva Categoría
        </button>
      </div>
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            {categories.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(category => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => { setEditingCategory(category); setShowCategoryModal(true); }}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay categorías registradas.</div>
        )}
      </div>
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        onSave={async (data) => {
          setModalLoading(true);
          if (editingCategory) {
            await categoriesAPI.update(editingCategory.id, data);
          } else {
            await categoriesAPI.create(data);
          }
          setShowCategoryModal(false);
          setEditingCategory(null);
          setModalLoading(false);
          loadCategories();
        }}
        category={editingCategory}
        loading={modalLoading}
      />
    </div>
  );
};

export default Categories;
