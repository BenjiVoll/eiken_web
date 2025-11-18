"use strict";
import { EntitySchema } from "typeorm";

export const QuoteSchema = new EntitySchema({
  name: "Quote",
  tableName: "quotes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    
    clientName: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "client_name",
    },
    clientEmail: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "client_email",
    },
    clientPhone: {
      type: "varchar",
      length: 50,
      nullable: false,
      name: "client_phone",
    },
    company: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    customServiceTitle: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "custom_service_title",
    },
    description: {
      type: "text",
      nullable: false,
    },
    urgency: {
      type: "enum",
      enum: ["Bajo", "Medio", "Alto", "Urgente"],
      nullable: false,
    },
    quotedAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "quoted_amount",
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
  
  relations: {
    service: {
      target: "Service",
      type: "many-to-one",
      joinColumn: {
        name: "service_id",
        referencedColumnName: "id",
      },
      nullable: true,
    },
    category: {
      target: "Category",
      type: "many-to-one",
      joinColumn: {
        name: "category_id",
        referencedColumnName: "id",
      },
      nullable: true,
    },
    quoteStatus: {
      type: "many-to-one",
      target: "QuoteStatus",
      joinColumn: { name: "quote_status_id" },
      inverseSide: "quotes",
      nullable: false,
    },
    quoteItems: {
      type: "one-to-many",
      target: "QuoteItem",
      inverseSide: "quote",
      cascade: true,
    },
    project: {
      type: "one-to-one",
      target: "Project",
      inverseSide: "quote",
    },
  },
  
  indices: [
    {
      name: "IDX_QUOTE_EMAIL",
      columns: ["clientEmail"],
    },
    {
      name: "IDX_QUOTE_URGENCY",
      columns: ["urgency"],
    },
  ],
});