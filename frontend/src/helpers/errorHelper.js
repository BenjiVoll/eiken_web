export const getErrorMessage = (error, defaultMessage = 'Ocurrió un error inesperado') => {
    if (error.response) {
        const { data } = error.response;
        if (data) {
            // 1. Check for specific Joi validation details
            if (data.details && Array.isArray(data.details) && data.details.length > 0) {
                // Return only the first error to keep UI clean, or join them
                // For now, let's join them with newlines or bullets if there are multiple
                if (data.details.length === 1) {
                    return data.details[0].message;
                }
                return data.details.map(d => `• ${d.message}`).join('\n');
            }

            // 1.1 Check if details is a single object with message (e.g. Auth Service)
            if (data.details && typeof data.details === 'object' && data.details.message) {
                return data.details.message;
            }

            // 2. Check for top-level message
            if (data.message) {
                return data.message;
            }
        }
        // 3. Fallback to status text
        if (error.response.statusText) {
            return `Error ${error.response.status}: ${error.response.statusText}`;
        }
        return `Error ${error.response.status}`;
    }

    // 4. Network errors (no response)
    if (error.request) {
        return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    // 5. Setup errors or code bugs
    return error.message || defaultMessage;
};
