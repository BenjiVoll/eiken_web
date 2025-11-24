"use strict";
import { EntitySchema } from "typeorm";

export const ProductSchema = new EntitySchema({
    name: "Product",
    tableName: "products",
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
        description: {
            type: "text",
            nullable: true,
        },
        price: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false,
        },
        stock: {
            type: "int",
            default: 0,
            nullable: false,
        },
        category: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        image: {
            type: "varchar",
            length: 500,
            nullable: true,
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
            name: "IDX_PRODUCT_NAME",
            columns: ["name"],
        },
        {
            name: "IDX_PRODUCT_CATEGORY",
            columns: ["category"],
        },
        {
            name: "IDX_PRODUCT_ACTIVE",
            columns: ["isActive"],
        },
    ],
});
