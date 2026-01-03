import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { productsAPI } from '@/services/apiService';

const TopProductsChart = ({ orders = [] }) => {
    const [productNames, setProductNames] = useState({});

    // Cargar nombres de productos
    useEffect(() => {
        const loadProductNames = async () => {
            try {
                const response = await productsAPI.getAll();
                // Según handleSuccess, la data real está en response.data.data
                const products = response?.data?.data || [];
                const namesMap = {};

                // Asegurarse de que products sea un array
                if (Array.isArray(products)) {
                    products.forEach(product => {
                        namesMap[product.id] = product.name;
                    });
                }

                setProductNames(namesMap);
            } catch (error) {
                console.error('Error cargando productos:', error);
            }
        };
        loadProductNames();
    }, []);

    // Contar cuántas veces se ordenó cada producto
    const productCounts = {};

    orders.forEach(order => {
        // Solo contar órdenes completadas
        if (order.status !== 'completed') return;

        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const productId = item.productId;

                // Skip non-product items (e.g. services)
                if (!productId) return;

                const productName = productNames[productId] || `Producto #${productId}`;

                if (!productCounts[productName]) {
                    productCounts[productName] = {
                        name: productName,
                        cantidad: 0,
                        ventas: 0
                    };
                }
                productCounts[productName].cantidad += parseInt(item.quantity) || 0;
                productCounts[productName].ventas += parseFloat(item.unitPrice || item.price || 0) * (parseInt(item.quantity) || 0);
            });
        }
    });

    // Convertir a array y ordenar por cantidad vendida
    const data = Object.values(productCounts)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5); // Top 5 productos

    // Si no hay datos
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Productos Más Vendidos
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <p>No hay datos de ventas disponibles</p>
                        <p className="text-sm mt-2 text-gray-400">
                            {orders.length} órdenes totales • {orders.filter(o => o.status === 'completed').length} completadas
                        </p>
                    </div>
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

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Productos Más Vendidos (Top 5)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis
                        type="number"
                        tickFormatter={formatCurrency}
                        hide={true}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value, name) => {
                            if (name === 'Ventas ($)') return [formatCurrency(value), 'Monto Total'];
                            if (name === 'Cantidad') return [value, 'Unidades Vendidas'];
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Bar
                        dataKey="ventas"
                        fill="#10B981"
                        name="Ventas ($)"
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                    />
                    {/* Cantidad se oculta del gráfico pero se mantiene para el tooltip */}
                    <Bar dataKey="cantidad" fill="transparent" name="Cantidad" legendType="none" />
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600 text-center border-t pt-4">
                Basado en {orders.filter(o => o.status === 'completed').length} orden(es) completada(s)
            </div>
        </div>
    );
};

export default TopProductsChart;
