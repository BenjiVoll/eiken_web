
"use strict";
import { EntitySchema } from "typeorm";

export const DetalleUsoViniloProyectoSchema = new EntitySchema({
  name: "DetalleUsoViniloProyecto",
  tableName: "detalle_uso_vinilo_proyecto", // Nombre de la tabla de unión
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
      name: "id_detalle_uso",
    },
    proyectoId: {
      type: "int",
      nullable: false,
      name: "id_proyecto",
    },
    productoViniloId: {
      type: "int",
      nullable: false,
      name: "id_vinilo",
    },
    rollosUtilizados: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
      name: "rollos_utilizados",
    },
    metrosCuadradosUtilizados: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "metros_cuadrados_utilizados",
    },
    fechaUso: {
      type: "timestamp",
      nullable: false,
      name: "fecha_uso",
      default: () => "CURRENT_TIMESTAMP", 
    },
  },
  relations: {
    proyectoServicio: {
      type: "many-to-one",
      target: "ProyectoServicio",
      joinColumn: { name: "id_proyecto", referencedColumnName: "id" },
      inverseSide: "vinilosUtilizados",
      nullable: false,
    },
    productoVinilo: {
      type: "many-to-one",
      target: "ProductoVinilo",
      joinColumn: { name: "id_vinilo", referencedColumnName: "id" },
      inverseSide: "usosEnProyectos",
      nullable: false,
    },
  },
});