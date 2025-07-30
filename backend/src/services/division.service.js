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
  return await divisionRepo.delete(parseInt(id));
};
