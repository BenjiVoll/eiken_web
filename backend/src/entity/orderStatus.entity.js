"use strict";
import { EntitySchema } from "typeorm";

export const OrderStatusSchema = new EntitySchema({
  name: "OrderStatus",
  tableName: "order_statuses",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 100,
      unique: true,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    colorCode: {
      type: "varchar",
      length: 50,
      nullable: true,
      name: "color_code",
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
    orders: {
      type: "one-to-many",
      target: "Order",
      inverseSide: "orderStatus",
    },
  },
});

export default OrderStatusSchema;
