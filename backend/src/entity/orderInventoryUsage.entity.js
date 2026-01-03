"use strict";
import { EntitySchema } from "typeorm";

export const OrderInventoryUsageSchema = new EntitySchema({
    name: "OrderInventoryUsage",
    tableName: "order_inventory_usage",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        orderId: {
            type: "int",
            nullable: false,
            name: "order_id",
        },
        inventoryId: {
            type: "int",
            nullable: false,
            name: "inventory_id",
        },
        quantityUsed: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false,
            name: "quantity_used",
        },
        notes: {
            type: "text",
            nullable: true,
        },
        registeredBy: {
            type: "int",
            nullable: true,
            name: "registered_by",
        },
        createdAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
            name: "created_at",
        },
    },
    relations: {
        order: {
            type: "many-to-one",
            target: "Order",
            joinColumn: { name: "order_id" },
        },
        inventory: {
            type: "many-to-one",
            target: "Inventory",
            joinColumn: { name: "inventory_id" },
        },
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "registered_by" },
        },
    },
});
