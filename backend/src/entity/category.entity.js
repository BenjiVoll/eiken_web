"use strict";
import { EntitySchema } from "typeorm";

export const CategorySchema = new EntitySchema({
  name: "Category",
  tableName: "categories",
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
    services: {
      type: "one-to-many",
      target: "Service",
      inverseSide: "category",
    },
  },
});
