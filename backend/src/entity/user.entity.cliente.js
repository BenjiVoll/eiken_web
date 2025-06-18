"use strict";
import { EntitySchema } from "typeorm";

export const ClienteSchema = new EntitySchema({
  name: "Cliente",
  tableName: "clientes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
      name: "id_cliente",
    },
    nombreEmpresaOPersona: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "nombre_empresa_o_persona",
    },
    rut: {
      type: "varchar",
      length: 50,
      nullable: true,
      unique: true,
      name: "rut",
    },
    contactoPrincipal: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "contacto_principal",
    },
    telefono: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    direccion: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    proyectos: {
      type: "one-to-many",
      target: "ProyectoServicio",
      inverseSide: "cliente",
      cascade: true,
    },
  },
});