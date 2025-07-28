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
      nullable: false,
      name: "client_id",
    },
    
    projectType: {
      type: "enum",
      enum: ["otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular"],
      nullable: false,
      name: "project_type",
    },
    division: {
      type: "enum",
      enum: ["design", "truck-design", "racing-design"],
      nullable: false,
    },
    
    status: {
      type: "enum",
      enum: ["pending", "in-progress", "approved", "completed", "cancelled"],
      nullable: false,
    },
    priority: {
      type: "enum",
      enum: ["low", "medium", "high", "urgent"],
      nullable: false,
    },
    
    budgetAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "budget_amount",
    },
    
    notes: {
      type: "text",
      nullable: true,
    },
    
    quoteId: {
      type: "int",
      nullable: true,
      name: "quote_id",
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
      name: "IDX_PROJECT_CLIENT",
      columns: ["clientId"],
    },
    {
      name: "IDX_PROJECT_STATUS",
      columns: ["status"],
    },
    {
      name: "IDX_PROJECT_PRIORITY", 
      columns: ["priority"],
    },
    {
      name: "IDX_PROJECT_DIVISION",
      columns: ["division"],
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
  },
});