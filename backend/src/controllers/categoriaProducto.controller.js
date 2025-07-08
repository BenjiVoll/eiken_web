"use strict";
import {
    createCategoriaProducto,
    updateCategoriaProducto,
    getCategoriasProducto,
    deleteCategoriaProducto
} from "../services/categoriaProducto.service.js";

export const createCategoriaProductoController = async (req, res) => {
    try {
        const categoria = await createCategoriaProducto(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateCategoriaProductoController = async (req, res) => {
    try {
        const categoria = await updateCategoriaProducto(req.params.id, req.body);
        res.status(200).json(categoria);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getCategoriasProductoController = async (req, res) => {
    try {
        const categorias = await getCategoriasProducto();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteCategoriaProductoController = async (req, res) => {
    try {
        await deleteCategoriaProducto(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};