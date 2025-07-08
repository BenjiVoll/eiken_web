"use strict";
import {
    createDetalleUsoVinilo,
    updateDetalleUsoVinilo,
    getDetallesUsoVinilo,
    deleteDetalleUsoVinilo
} from "../services/detalleUsoVinilo.service.js";

export const createDetalleUsoViniloController = async (req, res) => {
    try {
        const detalle = await createDetalleUsoVinilo(req.body);
        res.status(201).json(detalle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateDetalleUsoViniloController = async (req, res) => {
    try {
        const detalle = await updateDetalleUsoVinilo(req.params.id, req.body);
        res.status(200).json(detalle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getDetallesUsoViniloController = async (req, res) => {
    try {
        const detalles = await getDetallesUsoVinilo();
        res.status(200).json(detalles);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteDetalleUsoViniloController = async (req, res) => {
    try {
        await deleteDetalleUsoVinilo(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};