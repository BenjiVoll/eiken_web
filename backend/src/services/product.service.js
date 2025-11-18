"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProductSchema } from "../entity/product.entity.js";

const productRepository = AppDataSource.getRepository(ProductSchema);

export const getProducts = async () => {
  return await productRepository.find({
    where: { isActive: true },
    order: { name: "ASC" }
  });
};

export const getAllProducts = async () => {
  return await productRepository.find({
    order: { name: "ASC" }
  });
};

export const getProductById = async (id) => {
  const product = await productRepository.findOneBy({ id });
  if (!product) {
    throw new Error("Producto no encontrado");
  }
  return product;
};

export const createProduct = async (data) => {
  const { name, description, price, quantityOnHand, image } = data;
  
  const existingProduct = await productRepository.findOneBy({ name });
  if (existingProduct) {
    throw new Error("Ya existe un producto con este nombre");
  }

  const product = productRepository.create({
    name,
    description,
    price,
    quantityOnHand: quantityOnHand || 0,
    image,
    isActive: true
  });

  await productRepository.save(product);
  return product;
};

export const updateProduct = async (id, data) => {
  const product = await productRepository.findOneBy({ id });
  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (data.name && data.name !== product.name) {
    const existingProduct = await productRepository.findOneBy({ name: data.name });
    if (existingProduct && existingProduct.id !== id) {
      throw new Error("Ya existe un producto con este nombre");
    }
  }

  Object.assign(product, data);
  await productRepository.save(product);
  return product;
};

export const deleteProduct = async (id) => {
  const product = await productRepository.findOneBy({ id });
  if (!product) {
    throw new Error("Producto no encontrado");
  }

  // Soft delete
  product.isActive = false;
  await productRepository.save(product);
  return { message: "Producto desactivado correctamente" };
};

export const updateProductStock = async (id, quantity) => {
  const product = await productRepository.findOneBy({ id });
  if (!product) {
    throw new Error("Producto no encontrado");
  }

  product.quantityOnHand += quantity;
  
  if (product.quantityOnHand < 0) {
    throw new Error("Stock insuficiente");
  }

  await productRepository.save(product);
  return product;
};
