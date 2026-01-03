import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlySalesChart = ({ orders = [] }) => {
    // Agrupar órdenes por mes
    const monthlySales = {};

    orders.forEach(order => {
        // Solo contar órdenes completadas
        if (order.status === 'completed') {
            const date = new Date(order.orderDate || order.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('es-CL', { year: 'numeric', month: 'short' });

            if (!monthlySales[monthKey]) {
                monthlySales[monthKey] = {
                    month: monthName,
                    totalVentas: 0,
                    ordenes: 0
                };
            }

            monthlySales[monthKey].totalVentas += parseFloat(order.totalAmount || 0);
            monthlySales[monthKey].ordenes += 1;
        }
    });

    // Convertir a array y ordenar por fecha
    const data = Object.entries(monthlySales)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, value]) => value);

    // Si no hay datos
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Ventas Mensuales
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No hay datos de ventas disponibles</p>
                </div>
            </div>
        );
    }

    // Formatear moneda chilena
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Calcular totales
    const totalVentas = data.reduce((sum, item) => sum + item.totalVentas, 0);
    const totalOrdenes = data.reduce((sum, item) => sum + item.ordenes, 0);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Ventas Mensuales
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="month"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                    />
                    <YAxis tickFormatter={formatCurrency} />

                    <Tooltip
                        formatter={(value, name) => {
                            if (name === 'Ventas ($)') return [formatCurrency(value), 'Ventas'];
                            if (name === 'Órdenes') return [value, 'Órdenes'];
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="totalVentas"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Ventas ($)"
                        activeDot={{ r: 8 }}
                    />

                </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-gray-600">Total Ventas</p>
                    <p className="text-lg font-semibold text-green-700">{formatCurrency(totalVentas)}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                    <p className="text-gray-600">Total Órdenes</p>
                    <p className="text-lg font-semibold text-blue-700">{totalOrdenes}</p>
                </div>
            </div>
        </div>
    );
};

export default MonthlySalesChart;
