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
      type: "int",
      nullable: false,
    },
    division: {
      type: "int",
      nullable: false,
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    image: {
      type: "varchar",
      length: 500,
      nullable: true,
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
  ],
  relations: {
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: true,
      nullable: false,
      inverseSide: "services",
    },
    division: {
      type: "many-to-one",
      target: "Division",
      joinColumn: true,
      nullable: false,
      inverseSide: "services",
    },
    orderItems: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "service",
    },
  },
});
