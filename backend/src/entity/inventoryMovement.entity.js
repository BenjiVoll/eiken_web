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
            type: "decimal",
            precision: 10,
            scale: 2,
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
            type: "varchar",
            length: 50,
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
    relations: {
        inventory: {
            type: "many-to-one",
            target: "Inventory",
            joinColumn: { name: "inventory_id", referencedColumnName: "id" },
            nullable: false,
        },
        createdBy: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "created_by", referencedColumnName: "id" },
            nullable: false,
        },
    },
});
