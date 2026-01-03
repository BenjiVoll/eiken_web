"use strict";
import { EntitySchema } from "typeorm";

export const OrderItemSchema = new EntitySchema({
    name: "OrderItem",
    tableName: "order_items",
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
        serviceId: {
            type: "int",
            nullable: true,
            name: "service_id",
        },
        productId: {
            type: "int",
            nullable: true,
            name: "product_id",
        },
        quantity: {
            type: "int",
            nullable: false,
            default: 1,
        },
        unitPrice: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false,
            name: "unit_price",
        },
        totalPrice: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false,
            name: "total_price",
        },
        customizations: {
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
            name: "IDX_ORDER_ITEM_ORDER",
            columns: ["orderId"],
        },
        {
            name: "IDX_ORDER_ITEM_SERVICE",
            columns: ["serviceId"],
        },
        {
            name: "IDX_ORDER_ITEM_PRODUCT",
            columns: ["productId"],
        },
    ],
    relations: {
        order: {
            type: "many-to-one",
            target: "Order",
            joinColumn: { name: "order_id", referencedColumnName: "id" },
            inverseSide: "items",
            nullable: false,
            onDelete: "CASCADE",
        },
        service: {
            type: "many-to-one",
            target: "Service",
            joinColumn: { name: "service_id", referencedColumnName: "id" },
            inverseSide: "orderItems",
            nullable: true,
        },
        product: {
            type: "many-to-one",
            target: "Product",
            joinColumn: { name: "product_id", referencedColumnName: "id" },
            nullable: true,
        },
    },
});
