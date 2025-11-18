"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SupplierSchema } from "../entity/supplier.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { SupplierMaterialSchema } from "../entity/supplierMaterial.entity.js";

const supplierRepository = AppDataSource.getRepository(SupplierSchema);
const inventoryRepository = AppDataSource.getRepository(InventorySchema);
const supplierMaterialRepository = AppDataSource.getRepository(SupplierMaterialSchema);

export const createSupplier = async (data) => {
  const { name, contactPerson, phone, email, address, rut, website } = data;
  
  // Verificar si ya existe un proveedor con el mismo email (si se proporciona)
  if (email) {
    const existingSupplierEmail = await supplierRepository.findOneBy({ email });
    if (existingSupplierEmail) {
      throw new Error("Ya existe un proveedor con este email");
    }
  }

  // Verificar si ya existe un proveedor con el mismo RUT (si se proporciona)
  if (rut) {
    const existingSupplierRut = await supplierRepository.findOneBy({ rut });
    if (existingSupplierRut) {
      throw new Error("Ya existe un proveedor con este RUT");
    }
  }

  const supplier = supplierRepository.create({
    name,
    contactPerson,
    phone,
    email,
    address,
    rut,
    website,
    isActive: true
  });

  await supplierRepository.save(supplier);
  return supplier;
};

export const updateSupplier = async (id, data) => {
  const supplier = await supplierRepository.findOneBy({ id });
  if (!supplier) {
    throw new Error("Proveedor no encontrado");
  }

  // Si se está actualizando el email, verificar que no exista otro proveedor con ese email
  if (data.email && data.email !== supplier.email) {
    const existingSupplier = await supplierRepository.findOneBy({ email: data.email });
    if (existingSupplier) {
      throw new Error("Ya existe un proveedor con este email");
    }
  }

  // Si se está actualizando el RUT, verificar que no exista otro proveedor con ese RUT
  if (data.rut && data.rut !== supplier.rut) {
    const existingSupplier = await supplierRepository.findOneBy({ rut: data.rut });
    if (existingSupplier) {
      throw new Error("Ya existe un proveedor con este RUT");
    }
  }

  Object.assign(supplier, data);
  await supplierRepository.save(supplier);
  return supplier;
};

export const getSuppliers = async () => {
  const suppliers = await supplierRepository.find({
    order: { name: "ASC" }
  });
  return suppliers;
};

export const getActiveSuppliers = async () => {
  const suppliers = await supplierRepository.find({
    where: { isActive: true },
    order: { name: "ASC" }
  });
  return suppliers;
};

export const getSupplierById = async (id) => {
  const supplier = await supplierRepository.findOne({
    where: { id },
    relations: ["supplierMaterials", "supplierMaterials.material"]
  });
  return supplier;
};

export const getSupplierByEmail = async (email) => {
  const supplier = await supplierRepository.findOneBy({ email, isActive: true });
  return supplier;
};

export const getSupplierByRut = async (rut) => {
  const supplier = await supplierRepository.findOneBy({ rut, isActive: true });
  return supplier;
};

export const deleteSupplier = async (id) => {
  const supplier = await supplierRepository.findOne({
    where: { id },
    relations: ["supplierMaterials"]
  });
  
  if (!supplier) {
    throw new Error("Proveedor no encontrado");
  }

  // Verificar si el proveedor tiene materiales asociados
  if (supplier.supplierMaterials && supplier.supplierMaterials.length > 0) {
    throw new Error(`No se puede eliminar el proveedor porque tiene ${supplier.supplierMaterials.length} materiales asociados. Elimine primero las asociaciones.`);
  }

  // Hard delete - eliminar el registro
  await supplierRepository.remove(supplier);
  return { mensaje: "Proveedor eliminado exitosamente" };
};

// Funciones para gestionar la relación Supplier-Material
export const addMaterialToSupplier = async (supplierId, materialId, costPrice) => {
  const supplier = await supplierRepository.findOneBy({ id: supplierId });
  if (!supplier) {
    throw new Error("Proveedor no encontrado");
  }

  const material = await inventoryRepository.findOneBy({ id: materialId });
  if (!material) {
    throw new Error("Material no encontrado");
  }

  // Verificar si ya existe esta asociación
  const existing = await supplierMaterialRepository.findOne({
    where: {
      supplier: { id: supplierId },
      material: { id: materialId }
    }
  });

  if (existing) {
    throw new Error("Este material ya está asociado a este proveedor");
  }

  const supplierMaterial = supplierMaterialRepository.create({
    supplier,
    material,
    costPrice
  });

  await supplierMaterialRepository.save(supplierMaterial);
  return supplierMaterial;
};

export const updateMaterialCostPrice = async (supplierId, materialId, costPrice) => {
  const supplierMaterial = await supplierMaterialRepository.findOne({
    where: {
      supplier: { id: supplierId },
      material: { id: materialId }
    }
  });

  if (!supplierMaterial) {
    throw new Error("Asociación proveedor-material no encontrada");
  }

  supplierMaterial.costPrice = costPrice;
  await supplierMaterialRepository.save(supplierMaterial);
  return supplierMaterial;
};

export const removeMaterialFromSupplier = async (supplierId, materialId) => {
  const supplierMaterial = await supplierMaterialRepository.findOne({
    where: {
      supplier: { id: supplierId },
      material: { id: materialId }
    }
  });

  if (!supplierMaterial) {
    throw new Error("Asociación proveedor-material no encontrada");
  }

  await supplierMaterialRepository.remove(supplierMaterial);
  return { mensaje: "Material removido del proveedor exitosamente" };
};

export const getSupplierMaterials = async (supplierId) => {
  const supplierMaterials = await supplierMaterialRepository.find({
    where: { supplier: { id: supplierId } },
    relations: ["material"]
  });
  return supplierMaterials;
};

export const getMaterialSuppliers = async (materialId) => {
  const supplierMaterials = await supplierMaterialRepository.find({
    where: { material: { id: materialId } },
    relations: ["supplier"]
  });
  return supplierMaterials;
};
