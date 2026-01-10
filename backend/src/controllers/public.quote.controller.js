import { acceptQuoteByToken, rejectQuoteByToken } from "../services/quote.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export const acceptQuote = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return handleErrorClient(res, 400, "Token no proporcionado");
        }

        const result = await acceptQuoteByToken(token);

        handleSuccess(res, 200, "Cotización aceptada correctamente", result);

    } catch (error) {
        console.error(error);
        if (error.message.includes("inválido") || error.message.includes("expirado")) {
            return handleErrorClient(res, 400, error.message);
        }
        handleErrorServer(res, 500, "Error al procesar la aceptación");
    }
};

export const rejectQuote = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return handleErrorClient(res, 400, "Token no proporcionado");
        }

        const result = await rejectQuoteByToken(token);

        handleSuccess(res, 200, "Cotización rechazada correctamente", result);

    } catch (error) {
        console.error(error);
        if (error.message.includes("inválido") || error.message.includes("expirado") || error.message.includes("aprobada")) {
            return handleErrorClient(res, 400, error.message);
        }
        handleErrorServer(res, 500, "Error al procesar el rechazo");
    }
};
