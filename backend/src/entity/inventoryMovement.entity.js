"use strict";
import { EntitySchema } from "typeorm";

export const InventoryMovementSchema = new EntitySchema({
  name: "InventoryMovement",
  tableName: "inventory_movements",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    inventoryId: {
      type: "int",
      nullable: false,
      name: "inventory_id",
    },
    movementType: {
      type: "enum",
      enum: ["entrada", "salida", "ajuste", "transferencia"],
      nullable: false,
      name: "movement_type",
    },
    quantity: {
      type: "int",
      nullable: false,
    },
    reason: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    referenceId: {
      type: "int",
      nullable: true,
      name: "reference_id",
    },
    referenceType: {
      type: "enum",
      enum: ["order", "project", "adjustment", "supplier"],
      nullable: true,
      name: "reference_type",
    },
    createdById: {
      type: "int",
      nullable: false,
      name: "created_by",
    },
    notes: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
  },
  indices: [
    {
      name: "IDX_MOVEMENT_INVENTORY",
      columns: ["inventoryId"],
    },
    {
      name: "IDX_MOVEMENT_TYPE",
      columns: ["movementType"],
    },
    {
      name: "IDX_MOVEMENT_REFERENCE",
      columns: ["referenceType", "referenceId"],
    },
    {
      name: "IDX_MOVEMENT_CREATED",
      columns: ["createdAt"],
    },
  ],
  relations: {
    inventory: {
      type: "many-to-one",
      target: "Inventory",
      joinColumn: { name: "inventory_id", referencedColumnName: "id" },
      inverseSide: "movements",
      nullable: false,
      onDelete: "CASCADE",
    },
    createdBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "created_by", referencedColumnName: "id" },
      inverseSide: "inventoryMovements",
      nullable: false,
    },
  },
});
