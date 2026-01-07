import React, { useState, useEffect } from 'react';
import { usersAPI } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { Users, Search, Plus, Edit, Trash2 } from 'lucide-react';
import UserModal from '@/components/forms/UserModal';
import { getErrorMessage } from '@/helpers/errorHelper';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '@/helpers/sweetAlert';

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showErrorAlert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSave = async (userData) => {
    try {
      setModalLoading(true);
      if (selectedUser) {
        await usersAPI.update(selectedUser.id, userData);
        showSuccessAlert('Usuario Actualizado', 'Los datos del usuario se han guardado correctamente.');
      } else {
        await usersAPI.create(userData);
        showSuccessAlert('Usuario Creado', 'El nuevo usuario ha sido registrado exitosamente.');
      }
      setModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      const msg = getErrorMessage(error, 'Error al guardar usuario');
      showErrorAlert('Error', msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (user) => {
    const result = await confirmAlert(
      '¿Estás seguro?',
      `Se eliminará al usuario ${user.name}. Esta acción no se puede deshacer.`
    );

    if (result) {
      try {
        await usersAPI.delete(user.id);
        showSuccessAlert('Eliminado', 'El usuario ha sido eliminado.');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showErrorAlert('Error', 'No se pudo eliminar el usuario');
      }
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'designer': return 'Diseñador';
      case 'operator': return 'Operador';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'designer': return 'bg-purple-100 text-purple-800';
      case 'operator': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="h-8 w-8 mr-3 text-indigo-600" />
          Gestión de Usuarios
        </h1>
        <p className="mt-2 text-gray-600">
          Administra las cuentas y roles del personal
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
          />
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" /> Nuevo Usuario
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {user.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Creado: {new Date(user.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="p-2 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Editar"
                      onClick={() => handleOpenEdit(user)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 rounded text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay usuarios registrados.'}
          </p>
        </div>
      )}

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        loading={modalLoading}
      />
    </div>
  );
};

export default UsersPage;
