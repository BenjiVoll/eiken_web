import { AppDataSource } from "../config/configDb.js";
import { CategorySchema } from "../entity/category.entity.js";

const categoryRepo = AppDataSource.getRepository(CategorySchema);

export const getAllCategories = async () => {
  return await categoryRepo.find();
};

export const createCategory = async (name) => {
  const category = categoryRepo.create({ name });
  return await categoryRepo.save(category);
};

export const updateCategory = async (id, name) => {
  const category = await categoryRepo.findOneBy({ id: parseInt(id) });
  if (!category) return null;
  category.name = name;
  return await categoryRepo.save(category);
};

export const deleteCategory = async (id) => {
  return await categoryRepo.delete(parseInt(id));
};
