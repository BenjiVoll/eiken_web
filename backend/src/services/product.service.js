"use strict";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import { ProductSchema } from "../entity/product.entity.js";

const productRepository = AppDataSource.getRepository(ProductSchema);

export const createProduct = async (data) => {
    const { name, description, price, stock, categoryId, image } = data;

    const product = productRepository.create({
        name,
        description,
        price,
        stock: stock || 0,
        categoryId: categoryId ? parseInt(categoryId) : null,
        image,
        isActive: true
    });

    await productRepository.save(product);

    // Cargar el producto con su categoría
    return await productRepository.findOne({
        where: { id: product.id },
        relations: ['category']
    });
};

export const updateProduct = async (id, data) => {
    // Preparar datos para actualización
    const updateData = { ...data };

    // Si hay categoryId, convertirlo a número
    if (updateData.categoryId !== undefined) {
        updateData.categoryId = updateData.categoryId ? parseInt(updateData.categoryId) : null;
    }

    // Usar update() directamente que funciona mejor con foreign keys
    await productRepository.update(id, updateData);

    // Recargar para obtener la categoría actualizada
    const updatedProduct = await productRepository.findOne({
        where: { id },
        relations: ['category']
    });

    if (!updatedProduct) {
        throw new Error("Producto no encontrado después de actualizar");
    }

    return updatedProduct;
};

export const getProducts = async () => {
    const products = await productRepository.find({
        relations: ['category'],
        order: { name: "ASC" }
    });
    return products;
};

export const getActiveProducts = async () => {
    const products = await productRepository.find({
        where: { isActive: true },
        relations: ['category'],
        order: { name: "ASC" }
    });
    return products;
};

export const getProductById = async (id) => {
    const product = await productRepository.findOne({
        where: { id },
        relations: ['category']
    });
    return product;
};

export const deleteProduct = async (id) => {
    const product = await productRepository.findOne({
        where: { id },
        relations: ['category']
    });
    if (!product) {
        throw new Error("Producto no encontrado");
    }

    // Soft delete or Hard delete? 
    // Requirements don't specify strict rules for products like services.
    // We'll do hard delete but check if it's in any order (if we had order items linked to products).
    // Currently OrderItem links to Service, not Product (Store is new).
    // We should probably link OrderItem to Product too or have a separate OrderProduct entity.
    // For now, simple delete.

    await productRepository.remove(product);
    return { mensaje: "Producto eliminado exitosamente" };
};

export const deleteProductImage = async (id) => {
    const product = await productRepository.findOne({
        where: { id },
        relations: ['category']
    });
    if (!product || !product.image) {
        throw new Error("No hay imagen para eliminar");
    }
    const imagePath = path.join(process.cwd(), "uploads", product.image);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
    product.image = null;
    await productRepository.save(product);
    return true;
};
