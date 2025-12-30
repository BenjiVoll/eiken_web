"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProductMaterialSchema } from "../entity/productMaterial.entity.js";
import { ProductSchema } from "../entity/product.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";

const productMaterialRepository = AppDataSource.getRepository(ProductMaterialSchema);
const productRepository = AppDataSource.getRepository(ProductSchema);
const inventoryRepository = AppDataSource.getRepository(InventorySchema);

/**
 * Agregar material a un producto
 */
export const addMaterialToProduct = async (productId, materialData) => {
    const { inventoryId, quantityNeeded } = materialData;

    // Verificar que el producto existe
    const product = await productRepository.findOneBy({ id: productId });
    if (!product) {
        throw new Error("Producto no encontrado");
    }

    // Verificar que el item de inventario existe
    const inventoryItem = await inventoryRepository.findOneBy({ id: inventoryId });
    if (!inventoryItem) {
        throw new Error("Material de inventario no encontrado");
    }

    // Verificar que no exista ya esta asociación
    const existing = await productMaterialRepository.findOne({
        where: { productId, inventoryId }
    });

    if (existing) {
        throw new Error("Este material ya está asociado a este producto");
    }

    // Crear la asociación
    const productMaterial = productMaterialRepository.create({
        productId,
        inventoryId,
        quantityNeeded: parseFloat(quantityNeeded)
    });

    const saved = await productMaterialRepository.save(productMaterial);

    // Retornar con datos completos del material
    return await productMaterialRepository.findOne({
        where: { id: saved.id },
        relations: ["inventory"]
    });
};

/**
 * Obtener todos los materiales de un producto
 */
export const getProductMaterials = async (productId) => {
    return await productMaterialRepository.find({
        where: { productId },
        relations: ["inventory"],
        order: { createdAt: "ASC" }
    });
};

/**
 * Actualizar cantidad necesaria de un material
 */
export const updateProductMaterial = async (id, data) => {
    const { quantityNeeded } = data;

    const material = await productMaterialRepository.findOneBy({ id });
    if (!material) {
        throw new Error("Asociación de material no encontrada");
    }

    if (quantityNeeded !== undefined) {
        material.quantityNeeded = parseFloat(quantityNeeded);
    }

    return await productMaterialRepository.save(material);
};

/**
 * Eliminar material de un producto
 */
export const removeMaterialFromProduct = async (id) => {
    const material = await productMaterialRepository.findOneBy({ id });
    if (!material) {
        throw new Error("Asociación de material no encontrada");
    }

    await productMaterialRepository.remove(material);
    return { success: true };
};

/**
 * Eliminar todos los materiales de un producto
 */
export const removeAllProductMaterials = async (productId) => {
    await productMaterialRepository.delete({ productId });
    return { success: true };
};
