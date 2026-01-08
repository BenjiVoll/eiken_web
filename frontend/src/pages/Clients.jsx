import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import ClientsTable from '@/components/clients/ClientsTable';
import ClientModal from '@/components/forms/ClientModal';
import ClientsSidebarFilters from '@/components/clients/ClientsSidebarFilters';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '@/helpers/sweetAlert';
import { useAuth } from '@/context/AuthContext';
import { clientsAPI } from '@/services/apiService';

const Clients = () => {
    const { isManager, isAdmin } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estado del Modal
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Estado de Filtros
    const [selectedClientType, setSelectedClientType] = useState('all');
    const [visibility, setVisibility] = useState('all');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientsAPI.getAll();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading clients:', error);
            showErrorAlert('Error', 'No se pudieron cargar los clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClient = async (formData) => {
        try {
            setModalLoading(true);

            if (editingClient) {
                await clientsAPI.update(editingClient.id, formData);
                showSuccessAlert('¡Actualizado!', 'Cliente actualizado correctamente');
            } else {
                await clientsAPI.create(formData);
                showSuccessAlert('¡Creado!', 'Cliente creado correctamente');
            }

            await loadClients();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving client:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el cliente';
            showErrorAlert('Error', msg);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAlert(
            '¿Estás seguro?',
            'Esta acción eliminará o archivará al cliente. Si tiene cotizaciones o proyectos, se archivará.'
        );

        if (confirmed) {
            try {
                const response = await clientsAPI.delete(id);
                // The API might return { message, softDeleted: true }
                // Axios response is usually wrapper. The service returns { mensaje, softDeleted }?
                // backend controller sends res.status(204) if pure delete, OR json if soft delete?
                // Wait. `deleteClientController` does:
                // await deleteClient(id); res.status(204).send();
                // But `deleteClient` service returns an object!
                // Controller ignores the return object and sends 204! 
                // Ah! `deleteClientController` in 9337:
                /* 
                export const deleteClientController = async (req, res) => {
                    try {
                        await deleteClient(req.params.id);
                        res.status(204).send();
                    } catch...
                */
                // THIS IS A PROBLEM. If service does soft delete and returns message, Controller sends 204 (No Content).
                // Frontend won't see the message "Archived".
                // I need to fix `deleteClientController` to send 200 JSON if there is content.
                // I will do that in next step.
                // Assuming it returns correct message after fix:

                // If 204, it means deleted. If 200 with message, archived.
                // Frontend logic:
                await loadClients();

                // Since I can't read partial response if 204, I'll rely on controller fix.
                // If fixed, response.data will have message.
                if (response && response.message) {
                    // Or check status code?
                    // SweetAlert usually for success.
                    showSuccessAlert('¡Listo!', response.message || 'Cliente procesado correctamente');
                } else {
                    showSuccessAlert('¡Eliminado!', 'Cliente eliminado correctamente');
                }

            } catch (error) {
                console.error('Error deleting client:', error);
                const msg = error.response?.data?.error || 'No se pudo eliminar el cliente';
                showErrorAlert('Error', msg);
            }
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setEditingClient(null);
        setShowModal(false);
    };

    const handleClearFilters = () => {
        setSelectedClientType('all');
        setVisibility('all');
        setSearchTerm('');
    };

    // Lógica de Filtrado
    const filteredClients = clients.filter(client => {
        // Búsqueda
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (client.name || client.nombreEmpresaOPersona || '').toLowerCase().includes(searchLower) ||
            (client.email || '').toLowerCase().includes(searchLower) ||
            (client.company || '').toLowerCase().includes(searchLower);

        // Tipo de Cliente
        const matchesType = selectedClientType === 'all' || client.clientType === selectedClientType;

        // Visibilidad
        const matchesVisibility = visibility === 'all' ||
            (visibility === 'active' && client.isActive) ||
            (visibility === 'inactive' && !client.isActive);

        return matchesSearch && matchesType && matchesVisibility;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Encabezado */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Users className="h-8 w-8 mr-3 text-blue-600" />
                            Gestión de Clientes
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Administra tu base de datos de clientes particulares y empresas
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditingClient(null); setShowModal(true); }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Barra de Búsqueda */}
            <div className="mb-6 relative max-w-lg">
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o empresa..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                {/* Filtros Laterales */}
                <div className="lg:col-span-1">
                    <ClientsSidebarFilters
                        selectedClientType={selectedClientType}
                        onClientTypeChange={setSelectedClientType}
                        visibility={visibility}
                        onVisibilityChange={setVisibility}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {/* Tabla */}
                <div className="lg:col-span-3">
                    <div className="mb-4 text-sm text-gray-600">
                        Mostrando {filteredClients.length} de {clients.length} clientes
                    </div>
                    <ClientsTable
                        clients={filteredClients}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isManager={isManager || isAdmin} // Assuming isManager logic applies
                    />
                </div>
            </div>

            <ClientModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveClient}
                client={editingClient}
                loading={modalLoading}
            />
        </div>
    );
};

export default Clients;
