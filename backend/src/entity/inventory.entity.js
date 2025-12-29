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
    brand: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    model: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    unit: {
      type: "varchar",
      length: 50,
      default: "metros",
      nullable: false,
    },
    quantity: {
      type: "int",
      nullable: false,
      default: 0,
    },
    minStock: {
      type: "int",
      default: 5,
      nullable: false,
      name: "min_stock",
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
      name: "IDX_INVENTORY_BRAND",
      columns: ["brand"],
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
});