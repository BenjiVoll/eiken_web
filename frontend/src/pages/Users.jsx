import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/apiService';
import { Users, Search, Plus, Edit, Trash2 } from 'lucide-react';
import UserModal from '../components/forms/UserModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const MySwal = withReactContent(Swal);
  const handleOpenCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    const result = await MySwal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar a ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await usersAPI.delete(user.id);
        await loadUsers();
        MySwal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
      } catch {
        MySwal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedUser) {
        await usersAPI.update(selectedUser.id, formData);
        MySwal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
      } else {
        await usersAPI.create(formData);
        MySwal.fire('Creado', 'Usuario creado correctamente', 'success');
      }
      setModalOpen(false);
      await loadUsers();
    } catch {
      MySwal.fire('Error', 'No se pudo guardar el usuario', 'error');
    } finally {
      setModalLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'designer':
        return 'bg-green-100 text-green-800';
      case 'operator':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'designer':
        return 'Diseñador';
      case 'operator':
        return 'Operador';
      default:
        return role;
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
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="h-8 w-8 mr-3 text-red-600" />
          Usuarios
        </h1>
        <p className="mt-2 text-gray-600">Gestión de usuarios del sistema</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="mt-2 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Creado: {new Date(user.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 rounded hover:bg-blue-100"
                    title="Editar"
                    onClick={() => handleOpenEdit(user)}
                  >
                    <Edit className="h-5 w-5 text-blue-600" />
                  </button>
                  <button
                    className="p-2 rounded hover:bg-red-100"
                    title="Eliminar"
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
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
