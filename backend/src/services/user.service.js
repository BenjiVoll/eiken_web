"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";

export async function getUserService(query) {
  try {
    const { id, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const { passwordHash, ...userData } = userFound;

    return [userData, null];
  } catch (error) {
    console.error("Error obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getUsersService() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const users = await userRepository.find();

    if (!users || users.length === 0) return [null, "No hay usuarios"];

    const usersData = users.map(({ passwordHash, ...user }) => user);

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserService(query, body) {
  try {
    const { id, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    // Verificar si el email ya existe en otro usuario
    if (body.email && body.email !== userFound.email) {
      const existingUser = await userRepository.findOne({
        where: { email: body.email },
      });

      if (existingUser && existingUser.id !== userFound.id) {
        return [null, "Ya existe un usuario con el mismo email"];
      }
    }

    const dataUserUpdate = {};

    if (body.name) dataUserUpdate.name = body.name;
    if (body.email) dataUserUpdate.email = body.email;
    if (body.role) dataUserUpdate.role = body.role;
    if (typeof body.isActive === 'boolean') dataUserUpdate.isActive = body.isActive;

    // Solo actualizar password si se proporciona newPassword
    if (body.newPassword && body.newPassword.trim() !== "") {
      dataUserUpdate.passwordHash = await encryptPassword(body.newPassword);
    } else if (body.password && body.password.trim() !== "") {
      // Si se envía password (caso de creación), encriptarla
      dataUserUpdate.passwordHash = await encryptPassword(body.password);
    }

    await userRepository.update({ id: userFound.id }, dataUserUpdate);

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    const { passwordHash, ...userUpdated } = userData;

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al modificar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteUserService(query) {
  try {
    const { id, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.role === "admin") {
      return [null, "No se puede eliminar un usuario con rol de administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { passwordHash, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createUserService(userData) {
  try {
    const { name, email, password, role } = userData;

    const userRepository = AppDataSource.getRepository(User);

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return [null, "El usuario ya existe con ese email"];
    }

    // Encriptar la contraseña
    const hashedPassword = await encryptPassword(password);

    // Crear el nuevo usuario
    const newUser = userRepository.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: role || "operator", // rol por defecto
      isActive: userData.isActive !== undefined ? userData.isActive : true,
    });

    const savedUser = await userRepository.save(newUser);

    // Remover la contraseña del objeto retornado
    const { password: _, ...userWithoutPassword } = savedUser;

    return [userWithoutPassword, null];
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return [null, "Error interno del servidor"];
  }
}