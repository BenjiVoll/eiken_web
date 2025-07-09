"use strict";
import { EntitySchema } from "typeorm";

export const InventorySchema = new EntitySchema({
  name: "Inventory",
  tableName: "inventory",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    type: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    color: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    quantity: {
      type: "int",
      nullable: false,
      default: 0,
    },
    unit: {
      type: "varchar",
      length: 50,
      default: "metros",
      nullable: false,
    },
    width: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    brand: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    code: {
      type: "varchar",
      length: 100,
      nullable: false,
      unique: true,
    },
    minStock: {
      type: "int",
      default: 5,
      nullable: false,
      name: "min_stock",
    },
    unitCost: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "unit_cost",
    },
    supplierId: {
      type: "int",
      nullable: true,
      name: "supplier_id",
    },
    isActive: {
      type: "boolean",
      default: true,
      nullable: false,
      name: "is_active",
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
  indices: [
    {
      name: "IDX_INVENTORY_TYPE",
      columns: ["type"],
    },
    {
      name: "IDX_INVENTORY_CODE",
      columns: ["code"],
      unique: true,
    },
    {
      name: "IDX_INVENTORY_QUANTITY",
      columns: ["quantity"],
    },
    {
      name: "IDX_INVENTORY_ACTIVE",
      columns: ["isActive"],
    },
  ],
  relations: {
    supplier: {
      type: "many-to-one",
      target: "Supplier",
      joinColumn: { name: "supplier_id", referencedColumnName: "id" },
      inverseSide: "inventoryItems",
      nullable: true,
    },
    movements: {
      type: "one-to-many",
      target: "InventoryMovement",
      inverseSide: "inventory",
      cascade: true,
    },
    projectUsages: {
      type: "one-to-many",
      target: "ProjectInventoryUsage",
      inverseSide: "inventory",
    },
  },
});
