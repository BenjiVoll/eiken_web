"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD } from "./configEnv.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: 5432,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: ["src/entity/**/*.js"],
  synchronize: true,
  logging: false,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos!");
    
    // Eliminar enums problemáticos si existen
    try {
      await AppDataSource.query("DROP TYPE IF EXISTS services_division_enum CASCADE");
      await AppDataSource.query("DROP TYPE IF EXISTS projects_division_enum CASCADE");
      await AppDataSource.query("DROP TYPE IF EXISTS projects_status_enum CASCADE");
      await AppDataSource.query("DROP TYPE IF EXISTS projects_priority_enum CASCADE");
      await AppDataSource.query("DROP TYPE IF EXISTS quotes_urgency_enum CASCADE");
      await AppDataSource.query("DROP TYPE IF EXISTS quotes_status_enum CASCADE");
      console.log("=> Enums problemáticos eliminados");
    } catch (enumError) {
      console.log("=> Enums no existían o ya se eliminaron");
    }
    
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}