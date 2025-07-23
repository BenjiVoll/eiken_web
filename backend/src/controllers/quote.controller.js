"use strict";
import {
    createQuote as createQuoteService,
    updateQuote as updateQuoteService,
    getQuotes as getQuotesService,
    getQuoteById as getQuoteByIdService,
    deleteQuote as deleteQuoteService,
    getQuotesByStatus as getQuotesByStatusService,
    getQuotesByUrgency as getQuotesByUrgencyService,
    updateQuoteStatus as updateQuoteStatusService
} from "../services/quote.service.js";

// Crear una cotización
export const createQuote = async (req, res) => {
    try {
        const quote = await createQuoteService(req.body);
        res.status(201).json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar una cotización
export const updateQuote = async (req, res) => {
    try {
        const quote = await updateQuoteService(req.params.id, req.body);
        res.status(200).json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todas las cotizaciones
export const getQuotes = async (req, res) => {
    try {
        const quotes = await getQuotesService();
        res.status(200).json({
            status: "success",
            message: "Cotizaciones obtenidas exitosamente",
            data: quotes
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Obtener una cotización por ID
export const getQuote = async (req, res) => {
    try {
        const quote = await getQuoteByIdService(req.params.id);
        if (!quote) {
            return res.status(404).json({ error: "Cotización no encontrada" });
        }
        res.status(200).json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener cotizaciones por estado
export const getQuotesByStatus = async (req, res) => {
    try {
        const quotes = await getQuotesByStatusService(req.params.status);
        res.status(200).json(quotes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener cotizaciones por urgencia
export const getQuotesByUrgency = async (req, res) => {
    try {
        const quotes = await getQuotesByUrgencyService(req.params.urgency);
        res.status(200).json(quotes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener cotizaciones por cliente - DESHABILITADO (las quotes no tienen relación directa con clientes)
// export const getQuotesByClient = async (req, res) => {
//     try {
//         const quotes = await getQuotesByClientService(req.params.clientId);
//         res.status(200).json(quotes);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

// Actualizar estado de cotización
export const updateQuoteStatus = async (req, res) => {
    try {
        const quote = await updateQuoteStatusService(req.params.id, req.body.status);
        res.status(200).json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar una cotización
export const deleteQuote = async (req, res) => {
    try {
        await deleteQuoteService(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
