"use strict";
import { EntitySchema } from "typeorm";

export const ProjectSchema = new EntitySchema({
  name: "Project",
  tableName: "projects",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    title: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    clientId: {
      type: "int",
      nullable: true, // Cambiado a true temporalmente
      name: "client_id",
    },
    division: {
      type: "enum",
      enum: ["Design", "Truck Design", "Racing Design"],
      nullable: false,
    },
    category: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    status: {
      type: "enum",
      enum: ["pending", "in_progress", "completed", "cancelled", "on_hold"],
      default: "pending",
      nullable: false,
    },
    startDate: {
      type: "date",
      nullable: false,
      name: "start_date",
    },
    estimatedEndDate: {
      type: "date",
      nullable: true,
      name: "estimated_end_date",
    },
    actualEndDate: {
      type: "date",
      nullable: true,
      name: "actual_end_date",
    },
    budgetAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "budget_amount",
    },
    actualAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "actual_amount",
    },
    year: {
      type: "int",
      nullable: false,
    },
    month: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    imageUrl: {
      type: "varchar",
      length: 500,
      nullable: true,
      name: "image_url",
    },
    awards: {
      type: "simple-array",
      nullable: true,
    },
    tags: {
      type: "simple-array",
      nullable: true,
    },
    isFeatured: {
      type: "boolean",
      default: false,
      nullable: false,
      name: "is_featured",
    },
    isPublic: {
      type: "boolean",
      default: false,
      nullable: false,
      name: "is_public",
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
      name: "IDX_PROJECT_STATUS",
      columns: ["status"],
    },
    {
      name: "IDX_PROJECT_DIVISION",
      columns: ["division"],
    },
    {
      name: "IDX_PROJECT_CATEGORY",
      columns: ["category"],
    },
    {
      name: "IDX_PROJECT_YEAR",
      columns: ["year"],
    },
    {
      name: "IDX_PROJECT_FEATURED",
      columns: ["isFeatured"],
    },
    {
      name: "IDX_PROJECT_PUBLIC",
      columns: ["isPublic"],
    },
  ],
  relations: {
    client: {
      type: "many-to-one",
      target: "Client",
      joinColumn: { name: "client_id", referencedColumnName: "id" },
      inverseSide: "projects",
      nullable: true, // Cambiado a true temporalmente
    },
    inventoryUsages: {
      type: "one-to-many",
      target: "ProjectInventoryUsage",
      inverseSide: "project",
      cascade: true,
    },
  },
});