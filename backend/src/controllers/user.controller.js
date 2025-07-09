"use strict";
import {
    createUserService,
    getUsersService,
    getUserService,
    updateUserService,
    deleteUserService
} from "../services/user.service.js";

// Crear un usuario
export const createUserController = async (req, res) => {
    try {
        const [user, error] = await createUserService(req.body);
        
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error
            });
        }

        res.status(201).json({
            status: "success",
            message: "Usuario creado exitosamente",
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Actualizar un usuario
export const updateUserController = async (req, res) => {
    try {
        const [user, error] = await updateUserService({ id: req.params.id }, req.body);
        
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error
            });
        }

        res.status(200).json({
            status: "success",
            message: "Usuario actualizado exitosamente",
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Obtener todos los usuarios
export const getUsersController = async (req, res) => {
    try {
        const [users, error] = await getUsersService();
        
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error
            });
        }

        res.status(200).json({
            status: "success",
            message: "Usuarios obtenidos exitosamente",
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Obtener un usuario por ID
export const getUserController = async (req, res) => {
    try {
        const [user, error] = await getUserService({ id: req.params.id });
        
        if (error) {
            return res.status(404).json({
                status: "error",
                message: error
            });
        }

        res.status(200).json({
            status: "success",
            message: "Usuario encontrado",
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Eliminar un usuario
export const deleteUserController = async (req, res) => {
    try {
        const [user, error] = await deleteUserService({ id: req.params.id });
        
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error
            });
        }

        res.status(200).json({
            status: "success",
            message: "Usuario eliminado exitosamente",
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            message: "Error interno del servidor"
        });
    }
};