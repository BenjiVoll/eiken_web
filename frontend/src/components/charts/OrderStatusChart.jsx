import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
    pending: '#FFA500',      // Naranja - Pendiente
    processing: '#3B82F6',   // Azul - Procesando
    completed: '#10B981',    // Verde - Completado
    cancelled: '#EF4444'     // Rojo - Cancelado
};

const STATUS_LABELS = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    cancelled: 'Cancelado'
};

const OrderStatusChart = ({ orders = [] }) => {
    // Agrupar órdenes por estado
    const statusCounts = orders.reduce((acc, order) => {
        const status = order.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Convertir a formato para Recharts
    const data = Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        status: status
    }));

    // Si no hay datos, mostrar mensaje
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No hay órdenes disponibles</p>
            </div>
        );
    }

    // Renderizar label personalizado
    const renderLabel = (entry) => {
        return `${entry.name}: ${entry.value}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Estado de Órdenes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.status] || '#999999'}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600 text-center">
                Total de órdenes: {orders.length}
            </div>
        </div>
    );
};

export default OrderStatusChart;
