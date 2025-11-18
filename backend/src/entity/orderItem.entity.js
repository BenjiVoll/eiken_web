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
    quantity: {
      type: "int",
      nullable: false,
    },
    unitPrice: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      name: "unit_price",
    },
    subtotal: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
  },
  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: { name: "order_id" },
      inverseSide: "orderItems",
      nullable: false,
    },
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: { name: "product_id" },
      inverseSide: "orderItems",
      nullable: false,
    },
  },
});

export default OrderItemSchema;
