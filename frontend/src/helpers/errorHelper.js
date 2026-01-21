// Mensajes amigables para errores de base de datos
const foreignKeyMessages = {
    'order_inventory_usage': 'Esta orden tiene materiales registrados. Elimina los materiales primero.',
    'order_items': 'Este elemento tiene órdenes asociadas.',
    'orders': 'Este elemento tiene órdenes asociadas.',
    'projects': 'Este elemento tiene proyectos asociados.',
    'quotes': 'Este elemento tiene cotizaciones asociadas.',
    'inventory_movements': 'Este material tiene movimientos registrados en el historial.',
    'quote_images': 'Esta cotización tiene imágenes asociadas.',
    'product_materials': 'Este producto tiene materiales asignados.',
    'services': 'Esta categoría/división tiene servicios asociados.',
};

const translateForeignKeyError = (message) => {
    if (!message) return null;

    if (message.includes('viola la llave foránea') || message.includes('violates foreign key')) {
        for (const [table, friendlyMessage] of Object.entries(foreignKeyMessages)) {
            if (message.includes(table)) {
                return friendlyMessage;
            }
        }
        return 'No se puede eliminar porque tiene registros relacionados.';
    }
    return null;
};

// Extrae mensaje de error legible desde respuesta de API
export const getErrorMessage = (error, defaultMessage = 'Ocurrió un error inesperado') => {
    if (error.response) {
        const { data } = error.response;
        if (data) {
            const fkMessage = translateForeignKeyError(data.message || data.error);
            if (fkMessage) return fkMessage;

            if (data.details && Array.isArray(data.details) && data.details.length > 0) {
                if (data.details.length === 1) return data.details[0].message;
                return data.details.map(d => `• ${d.message}`).join('\n');
            }

            if (data.details?.message) return data.details.message;
            if (data.error) return data.error;
            if (data.message) return data.message;
        }

        if (error.response.statusText) {
            return `Error ${error.response.status}: ${error.response.statusText}`;
        }
        return `Error ${error.response.status}`;
    }

    if (error.request) {
        return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return error.message || defaultMessage;
};
