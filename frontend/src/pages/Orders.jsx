import React, { useState, useEffect } from 'react';
import { ordersAPI } from '@/services/apiService';
import { Package, Search, Filter, Eye, Trash2, Box } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/helpers/sweetAlert';
import MaterialUsageModal from '@/components/orders/MaterialUsageModal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [orderMaterials, setOrderMaterials] = useState([]);

    const statuses = ['all', 'pending', 'processing', 'completed', 'cancelled'];
    const statusLabels = {
        all: 'Todos',
        pending: 'Pendiente',
        processing: 'Procesando',
        completed: 'Completado',
        cancelled: 'Cancelado'
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            showErrorAlert('Error', 'No se pudieron cargar las órdenes');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            showSuccessAlert('¡Actualizado!', 'El estado de la orden ha sido actualizado');
            loadOrders();
        } catch (error) {
            showErrorAlert('Error', 'No se pudo actualizar el estado');
        }
    };

    const handleDelete = async (orderId) => {
        const confirmed = await showConfirmAlert(
            '¿Eliminar orden?',
            'Esta acción no se puede deshacer'
        );
        if (confirmed) {
            try {
                await ordersAPI.delete(orderId);
                showSuccessAlert('¡Eliminado!', 'La orden ha sido eliminada');
                loadOrders();
            } catch (error) {
                showErrorAlert('Error', 'No se pudo eliminar la orden');
            }
        }
    };

    const handleViewDetails = async (orderId) => {
        try {
            const response = await ordersAPI.getById(orderId);
            setSelectedOrder(response.data.data);
            setShowDetailModal(true);
            // Cargar materiales si la orden está completada
            if (response.data.data.status === 'completed') {
                loadOrderMaterials(orderId);
            }
        } catch (error) {
            showErrorAlert('Error', 'No se pudieron cargar los detalles');
        }
    };

    const loadOrderMaterials = async (orderId) => {
        try {
            const response = await ordersAPI.getMaterials(orderId);
            setOrderMaterials(response.data.data || []);
        } catch (error) {
            console.error('Error loading materials:', error);
            setOrderMaterials([]);
        }
    };

    const handleMaterialSuccess = () => {
        if (selectedOrder) {
            loadOrderMaterials(selectedOrder.id);
            showSuccessAlert('¡Registrado!', 'Los materiales han sido registrados exitosamente');
        }
    };

    const handleDeleteMaterial = async (usageId) => {
        const confirmed = await showConfirmAlert(
            '¿Eliminar registro?',
            'Esto restaurará el stock del material'
        );
        if (confirmed) {
            try {
                await ordersAPI.deleteMaterial(usageId);
                showSuccessAlert('¡Eliminado!', 'El material ha sido eliminado y el stock restaurado');
                if (selectedOrder) {
                    loadOrderMaterials(selectedOrder.id);
                }
            } catch (error) {
                showErrorAlert('Error', 'No se pudo eliminar el registro');
            }
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Package className="h-8 w-8 mr-2" />
                    Gestión de Órdenes
                </h1>
                <p className="text-gray-600 mt-1">Administra las órdenes de la tienda online</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, email o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        {statuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${selectedStatus === status
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {statusLabels[status]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No se encontraron órdenes</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.clientName}</div>
                                        <div className="text-sm text-gray-500">{order.clientEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.orderDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}
                                        >
                                            {statuses.filter(s => s !== 'all').map(status => (
                                                <option key={status} value={status}>
                                                    {statusLabels[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetails(order.id)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            title="Ver detalles"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold">Orden #{selectedOrder.id}</h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Información del Cliente</h3>
                                    <p><span className="font-medium">Nombre:</span> {selectedOrder.clientName}</p>
                                    <p><span className="font-medium">Email:</span> {selectedOrder.clientEmail}</p>
                                    <p><span className="font-medium">Fecha:</span> {formatDate(selectedOrder.orderDate)}</p>
                                    {selectedOrder.notes && (
                                        <p><span className="font-medium">Notas:</span> {selectedOrder.notes}</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Productos</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Precio Unit.</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedOrder.items?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2">{item.product?.name || item.service?.name || 'N/A'}</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">{formatPrice(item.unitPrice)}</td>
                                                        <td className="px-4 py-2 text-right font-semibold">{formatPrice(item.totalPrice)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-2 text-right font-bold">Total:</td>
                                                    <td className="px-4 py-2 text-right font-bold text-lg">{formatPrice(selectedOrder.totalAmount)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Materials Used Section - Only for completed orders */}
                                {selectedOrder.status === 'completed' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-semibold text-gray-700">Materiales Consumidos</h3>
                                            <button
                                                onClick={() => setShowMaterialModal(true)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                                            >
                                                <Box className="h-4 w-4" />
                                                Registrar Materiales
                                            </button>
                                        </div>

                                        {orderMaterials.length > 0 ? (
                                            <div className="border rounded-lg overflow-hidden">
                                                <table className="min-w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Registrado por</th>
                                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {orderMaterials.map((material) => (
                                                            <tr key={material.id}>
                                                                <td className="px-4 py-2">
                                                                    <div className="font-medium">{material.inventory.name}</div>
                                                                    <div className="text-xs text-gray-500">{material.inventory.type}</div>
                                                                    {material.notes && (
                                                                        <div className="text-xs text-gray-400 mt-1">{material.notes}</div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <span className="font-semibold">{material.quantityUsed}</span> {material.inventory.unit}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                                    {material.registeredBy?.name || 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-2 text-right">
                                                                    <button
                                                                        onClick={() => handleDeleteMaterial(material.id)}
                                                                        className="text-red-600 hover:text-red-900 text-sm"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <Box className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                <p>No se han registrado materiales para esta orden</p>
                                                <p className="text-sm mt-1">Haz click en "Registrar Materiales" para comenzar</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Material Usage Modal */}
            <MaterialUsageModal
                isOpen={showMaterialModal}
                onClose={() => setShowMaterialModal(false)}
                orderId={selectedOrder?.id}
                onSuccess={handleMaterialSuccess}
            />
        </div>
    );
};

export default Orders;
