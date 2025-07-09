"use strict";
import { EntitySchema } from "typeorm";

export const ServiceSchema = new EntitySchema({
  name: "Service",
  tableName: "services",
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
    category: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    division: {
      type: "enum",
      enum: ["Design", "Truck Design", "Racing Design"],
      nullable: false,
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    imageUrl: {
      type: "varchar",
      length: 500,
      nullable: true,
      name: "image_url",
    },
    rating: {
      type: "decimal",
      precision: 2,
      scale: 1,
      default: 0,
      nullable: false,
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
      name: "IDX_SERVICE_CATEGORY",
      columns: ["category"],
    },
    {
      name: "IDX_SERVICE_DIVISION",
      columns: ["division"],
    },
    {
      name: "IDX_SERVICE_ACTIVE",
      columns: ["isActive"],
    },
  ],
  relations: {
    orderItems: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "service",
    },
  },
});
