"use strict";
import { EntitySchema } from "typeorm";

export const SupplierMaterialSchema = new EntitySchema({
  name: "SupplierMaterial",
  tableName: "supplier_materials",
  columns: {
    supplierId: {
      type: "int",
      primary: true,
      name: "supplier_id",
    },
    materialId: {
      type: "int",
      primary: true,
      name: "material_id",
    },
    costPrice: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "cost_price",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      nullable: false,
      name: "updated_at",
    },
  },
  relations: {
    supplier: {
      type: "many-to-one",
      target: "Supplier",
      joinColumn: { name: "supplier_id" },
      inverseSide: "supplierMaterials",
      nullable: false,
    },
    material: {
      type: "many-to-one",
      target: "Inventory",
      joinColumn: { name: "material_id" },
      inverseSide: "supplierMaterials",
      nullable: false,
    },
  },
});

export default SupplierMaterialSchema;
