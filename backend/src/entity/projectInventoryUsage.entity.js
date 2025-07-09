"use strict";
import { EntitySchema } from "typeorm";

export const ProjectInventoryUsageSchema = new EntitySchema({
  name: "ProjectInventoryUsage",
  tableName: "project_inventory_usage",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    projectId: {
      type: "int",
      nullable: false,
      name: "project_id",
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
    unit: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "metros",
    },
    squareMetersUsed: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "square_meters_used",
    },
    unitCost: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "unit_cost",
    },
    totalCost: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "total_cost",
    },
    usageDate: {
      type: "timestamp",
      nullable: false,
      name: "usage_date",
      default: () => "CURRENT_TIMESTAMP",
    },
    notes: {
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
      name: "IDX_USAGE_PROJECT",
      columns: ["projectId"],
    },
    {
      name: "IDX_USAGE_INVENTORY",
      columns: ["inventoryId"],
    },
    {
      name: "IDX_USAGE_DATE",
      columns: ["usageDate"],
    },
  ],
  relations: {
    project: {
      type: "many-to-one",
      target: "Project",
      joinColumn: { name: "project_id", referencedColumnName: "id" },
      inverseSide: "inventoryUsages",
      nullable: false,
      onDelete: "CASCADE",
    },
    inventory: {
      type: "many-to-one",
      target: "Inventory",
      joinColumn: { name: "inventory_id", referencedColumnName: "id" },
      inverseSide: "projectUsages",
      nullable: false,
    },
  },
});
