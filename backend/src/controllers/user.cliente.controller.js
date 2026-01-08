"use strict";
import {
    createClient,
    updateClient,
    getClients,
    getClientById,
    deleteClient,
    getClientByEmail,
    getClientByRut,
    getClientsWithProjects
} from "../services/client.service.js";

// Crear un cliente
export const createClientController = async (req, res) => {
    try {
        const client = await createClient(req.body);
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un cliente
export const updateClientController = async (req, res) => {
    try {
        const client = await updateClient(req.params.id, req.body);
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los clientes
export const getClientsController = async (req, res) => {
    try {
        const clients = await getClients();
        res.status(200).json(clients);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un cliente por ID
export const getClientByIdController = async (req, res) => {
    try {
        const client = await getClientById(req.params.id);
        if (!client) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un cliente por email
export const getClientByEmailController = async (req, res) => {
    try {
        const client = await getClientByEmail(req.params.email);
        if (!client) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un cliente por RUT
export const getClientByRutController = async (req, res) => {
    try {
        const client = await getClientByRut(req.params.rut);
        if (!client) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener clientes con sus proyectos
export const getClientsWithProjectsController = async (req, res) => {
    try {
        const clients = await getClientsWithProjects();
        res.status(200).json(clients);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un cliente
// Eliminar un cliente
export const deleteClientController = async (req, res) => {
    try {
        const result = await deleteClient(req.params.id);

        // Si hay un mensaje o flag de softDeleted, devolver 200 con el body
        if (result && (result.mensaje || result.softDeleted)) {
            return res.status(200).json(result);
        }

        // Si es borrado físico puro sin mensaje (aunque el servicio siempre devuelve mensaje), 204
        // Pero nuestro servicio modificado SIEMPRE devuelve { mensaje }.
        // Así que mejor devolvemos 200 siempre para que el frontend pueda mostrar el alert.
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
