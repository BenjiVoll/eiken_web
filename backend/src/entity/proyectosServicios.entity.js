"use strict";
import { EntitySchema } from "typeorm";

export const ProyectoServicioSchema = new EntitySchema({
  name: "ProyectoServicio",
  tableName: "proyectos_servicios",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
      name: "id_proyecto",
    },
    clienteId: {
      type: "int",
      nullable: false,
      name: "id_cliente",
    },
    nombreProyecto: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "nombre_proyecto",
    },
    tipoServicio: {
      type: "varchar",
      length: 100,
      nullable: false,
      name: "tipo_servicio",
    },
    fechaInicio: {
      type: "date",
      nullable: false,
      name: "fecha_inicio",
    },
    fechaFinEstimada: {
      type: "date",
      nullable: true,
      name: "fecha_fin_estimada",
    },
    estadoProyecto: {
      type: "enum",
      enum: ["pendiente", "en_proceso", "completado", "cancelado"],
      nullable: false,
      default: "pendiente",
      name: "estado_proyecto",
    },
    descripcionProyecto: {
      type: "text",
      nullable: true,
      name: "descripcion_proyecto",
    },
  },
  relations: {
    cliente: {
      type: "many-to-one",
      target: "Cliente",
      joinColumn: { name: "id_cliente", referencedColumnName: "id" },
      inverseSide: "proyectos", 
      nullable: false,
    },
    vinilosUtilizados: {
      type: "one-to-many",
      target: "DetalleUsoViniloProyecto",
      inverseSide: "proyectoServicio",
      cascade: true,
    },
  },
});