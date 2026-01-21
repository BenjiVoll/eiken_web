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
  const categoryId = parseInt(id);

  // Verificar si la categoría existe
  const category = await categoryRepo.findOneBy({ id: categoryId });
  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  // Verificar si tiene servicios asociados
  const servicesResult = await AppDataSource.query(
    "SELECT COUNT(*) as count FROM services WHERE category = $1",
    [categoryId]
  );

  const servicesCount = parseInt(servicesResult[0]?.count || 0);
  if (servicesCount > 0) {
    throw new Error(`No se puede eliminar la categoría porque tiene ${servicesCount} servicio(s) asociado(s)`);
  }

  // Verificar si tiene proyectos asociados
  const projectsResult = await AppDataSource.query(
    "SELECT COUNT(*) as count FROM projects WHERE category = $1",
    [categoryId]
  );

  const projectsCount = parseInt(projectsResult[0]?.count || 0);
  if (projectsCount > 0) {
    throw new Error(`No se puede eliminar la categoría porque tiene ${projectsCount} proyecto(s) asociado(s)`);
  }

  return await categoryRepo.delete(categoryId);
};
