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
    priority: {
      type: "enum",
      enum: ["Bajo", "Medio", "Alto", "Urgente"],
      nullable: false,
      default: "Medio",
    },
    
    budgetAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "budget_amount",
    },
    image: {
      type: "varchar",
      length: 500,
      nullable: true,
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
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      nullable: false,
      name: "updated_at",
    },
  },
  
  indices: [
    {
      name: "IDX_PROJECT_PRIORITY", 
      columns: ["priority"],
    },
  ],
  
  relations: {
    client: {
      type: "many-to-one",
      target: "Client",
      joinColumn: { name: "client_id", referencedColumnName: "id" },
      inverseSide: "projects",
      nullable: false,
    },
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: { name: "category_id", referencedColumnName: "id" },
      inverseSide: "projects",
      nullable: false,
    },
    division: {
      type: "many-to-one",
      target: "Division",
      joinColumn: { name: "division_id" },
      inverseSide: "projects",
      nullable: false,
    },
    quote: {
      type: "many-to-one",
      target: "Quote",
      joinColumn: { name: "quote_id" },
      nullable: true,
    },
    projectStatus: {
      type: "many-to-one",
      target: "ProjectStatus",
      joinColumn: { name: "project_status_id" },
      inverseSide: "projects",
      nullable: false,
    },
  },
});