import { AppDataSource } from "../config/configDb.js";
import { DivisionSchema } from "../entity/division.entity.js";

const divisionRepo = AppDataSource.getRepository(DivisionSchema);

export const getAllDivisions = async () => {
  return await divisionRepo.find();
};

export const createDivision = async (name) => {
  const division = divisionRepo.create({ name });
  return await divisionRepo.save(division);
};

export const updateDivision = async (id, name) => {
  const division = await divisionRepo.findOneBy({ id: parseInt(id) });
  if (!division) return null;
  division.name = name;
  return await divisionRepo.save(division);
};

export const deleteDivision = async (id) => {
  const divisionId = parseInt(id);
  
  // Verificar si la división existe
  const division = await divisionRepo.findOneBy({ id: divisionId });
  if (!division) {
    throw new Error("División no encontrada");
  }

  // Verificar si tiene servicios asociados
  const servicesResult = await AppDataSource.query(
    "SELECT COUNT(*) as count FROM services WHERE division = $1",
    [divisionId]
  );

  const servicesCount = parseInt(servicesResult[0]?.count || 0);
  if (servicesCount > 0) {
    throw new Error(`No se puede eliminar la división porque tiene ${servicesCount} servicio(s) asociado(s)`);
  }

  // Verificar si tiene proyectos asociados
  const projectsResult = await AppDataSource.query(
    "SELECT COUNT(*) as count FROM projects WHERE division = $1",
    [divisionId]
  );

  const projectsCount = parseInt(projectsResult[0]?.count || 0);
  if (projectsCount > 0) {
    throw new Error(`No se puede eliminar la división porque tiene ${projectsCount} proyecto(s) asociado(s)`);
  }

  return await divisionRepo.delete(divisionId);
};
