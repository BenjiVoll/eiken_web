"use strict";
import { EntitySchema } from "typeorm";

export const ProductMaterialSchema = new EntitySchema({
    name: "ProductMaterial",
    tableName: "product_materials",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true
        },
        productId: {
            name: "product_id",
            type: "int",
            nullable: false
        },
        inventoryId: {
            name: "inventory_id",
            type: "int",
            nullable: false
        },
        quantityNeeded: {
            name: "quantity_needed",
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false
        },
        createdAt: {
            name: "created_at",
            type: "timestamp",
            createDate: true
        },
        updatedAt: {
            name: "updated_at",
            type: "timestamp",
            updateDate: true
        }
    },
    relations: {
        product: {
            type: "many-to-one",
            target: "Product",
            joinColumn: { name: "product_id" },
            onDelete: "CASCADE"
        },
        inventory: {
            type: "many-to-one",
            target: "Inventory",
            joinColumn: { name: "inventory_id" },
            onDelete: "RESTRICT"
        }
    }
});
