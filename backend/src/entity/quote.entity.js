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
    
    serviceId: {
      type: "int",
      nullable: true,
      name: "service_id",
    },
    customServiceTitle: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "custom_service_title",
    },
    serviceType: {
      type: "enum",
      enum: ["otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular"],
      nullable: false,
      name: "service_type",
    },
    description: {
      type: "text",
      nullable: false,
    },
    urgency: {
      type: "enum",
      enum: ["low", "medium", "high", "urgent"],
      nullable: false,
    },
    
    status: {
      type: "enum",
      enum: ["pending", "reviewing", "quoted", "approved", "rejected"],
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
  },
  
  indices: [
    {
      name: "IDX_QUOTE_STATUS",
      columns: ["status"],
    },
    {
      name: "IDX_QUOTE_EMAIL",
      columns: ["clientEmail"],
    },
    {
      name: "IDX_QUOTE_URGENCY",
      columns: ["urgency"],
    },
    {
      name: "IDX_QUOTE_SERVICE",
      columns: ["serviceId"],
    },
  ],
});