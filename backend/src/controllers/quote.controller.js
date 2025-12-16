"use strict";
import {
    createQuote as createQuoteService,
    updateQuote as updateQuoteService,
    getQuotes as getQuotesService,
    getQuoteById as getQuoteByIdService,
    deleteQuote as deleteQuoteService,
    getQuotesByStatus as getQuotesByStatusService,
    getQuotesByUrgency as getQuotesByUrgencyService,
    updateQuoteStatus as updateQuoteStatusService,
    convertQuoteToProject as convertQuoteToProjectService
} from "../services/quote.service.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
import { createActivityService } from "../services/activity.service.js";

// Crear una cotización
export const createQuote = async (req, res) => {
    try {
        const quote = await createQuoteService(req.body);
        // Registrar actividad
        await createActivityService({
            type: "cotización",
            description: `Cotización de ${quote.clientName || 'cliente'} creada.`,
            userId: req.user?.id || null,
        });
        handleSuccess(res, 201, "Cotización creada exitosamente", quote);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Actualizar una cotización
export const updateQuote = async (req, res) => {
    try {
        const quote = await updateQuoteService(req.params.id, req.body);
        // Registrar actividad de edición
        await createActivityService({
            type: "cotización",
            description: `Cotización de ${quote.clientName || 'cliente'} editada.`,
            userId: req.user?.id || null,
        });
        handleSuccess(res, 200, "Cotización actualizada exitosamente", quote);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
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

// Actualizar estado de cotización
export const updateQuoteStatus = async (req, res) => {
    try {
        const quote = await updateQuoteStatusService(req.params.id, req.body.status);
        res.status(200).json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Convertir cotización a proyecto
export const convertQuoteToProject = async (req, res) => {
    try {
        const project = await convertQuoteToProjectService(req.params.id);
        // Registrar actividad
        await createActivityService({
            type: "proyecto",
            description: `Proyecto generado desde cotización #${req.params.id}`,
            userId: req.user?.id || null,
        });
        handleSuccess(res, 201, "Cotización convertida a proyecto exitosamente", project);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Responder a una cotización
export const replyQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, message } = req.body;

        // Import dynamically to avoid circular dependency issues if any, 
        // though here we are importing from service at top.
        // We need to add replyToQuote to the imports at the top first.
        const { replyToQuote: replyToQuoteService } = await import("../services/quote.service.js");

        const quote = await replyToQuoteService(id, amount, message);

        await createActivityService({
            type: "cotización",
            description: `Respuesta enviada a cotización #${id}`,
            userId: req.user?.id || null,
        });

        handleSuccess(res, 200, "Respuesta enviada exitosamente", quote);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Eliminar una cotización
export const deleteQuote = async (req, res) => {
    try {
        const deletedQuote = await getQuoteByIdService(req.params.id);
        await deleteQuoteService(req.params.id);
        // Registrar actividad de eliminación con nombre
        await createActivityService({
            type: "cotización",
            description: `Cotización de ${deletedQuote?.clientName || 'cliente'} eliminada.`,
            userId: req.user?.id || null,
            quoteId: deletedQuote?.id || null,
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
