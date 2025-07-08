"use strict";
import {
    createCliente,
    updateCliente,
    getClientes,
    getClienteById,
    deleteCliente
} from "../services/cliente.service.js";

// Crear un cliente
export const createClienteController = async (req, res) => {
    try {
        const cliente = await createCliente(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un cliente
export const updateClienteController = async (req, res) => {
    try {
        const cliente = await updateCliente(req.params.id, req.body);
        res.status(200).json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los clientes
export const getClientesController = async (req, res) => {
    try {
        const clientes = await getClientes();
        res.status(200).json(clientes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un cliente por ID
export const getClienteByIdController = async (req, res) => {
    try {
        const cliente = await getClienteById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un cliente
export const deleteClienteController = async (req, res) => {
    try {
        await deleteCliente(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
