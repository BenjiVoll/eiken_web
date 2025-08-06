"use strict";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service.js";

// Crear categoría
export const createCategoryController = async (req, res) => {
  try {
    const category = await createCategory(req.body.name);
    res.status(201).json({
      status: "success",
      message: "Categoría creada exitosamente",
      data: category
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Actualizar categoría
export const updateCategoryController = async (req, res) => {
  try {
    const category = await updateCategory(req.params.id, req.body.name);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Categoría no encontrada"
      });
    }
    res.status(200).json({
      status: "success",
      message: "Categoría actualizada",
      data: category
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Obtener todas las categorías
export const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json({
      status: "success",
      message: "Categorías obtenidas exitosamente",
      data: categories
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Eliminar categoría
export const deleteCategoryController = async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    // Si el error es sobre elementos asociados, usar status 409 (Conflict)
    const statusCode = error.message.includes("tiene") && error.message.includes("asociado") ? 409 : 400;
    res.status(statusCode).json({
      status: "error",
      message: error.message
    });
  }
};
