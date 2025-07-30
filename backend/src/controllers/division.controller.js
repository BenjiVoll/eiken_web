"use strict";
import {
  getAllDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
} from "../services/division.service.js";

// Crear división
export const createDivisionController = async (req, res) => {
  try {
    const division = await createDivision(req.body.name);
    res.status(201).json({
      status: "success",
      message: "División creada exitosamente",
      data: division
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Actualizar división
export const updateDivisionController = async (req, res) => {
  try {
    const division = await updateDivision(req.params.id, req.body.name);
    if (!division) {
      return res.status(404).json({
        status: "error",
        message: "División no encontrada"
      });
    }
    res.status(200).json({
      status: "success",
      message: "División actualizada",
      data: division
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Obtener todas las divisiones
export const getDivisions = async (req, res) => {
  try {
    const divisions = await getAllDivisions();
    res.status(200).json({
      status: "success",
      message: "Divisiones obtenidas exitosamente",
      data: divisions
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Eliminar división
export const deleteDivisionController = async (req, res) => {
  try {
    await deleteDivision(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};
