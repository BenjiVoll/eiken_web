"use strict";
import User from "../entity/user.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";

export async function loginService(user) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password } = user;

    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message
    });

    const userFound = await userRepository.findOne({
      where: { email }
    });

    if (!userFound) {
      return [null, createErrorMessage("email", "El correo electrónico es incorrecto")];
    }

    const isMatch = await comparePassword(password, userFound.passwordHash);

    if (!isMatch) {
      return [null, createErrorMessage("password", "La contraseña es incorrecta")];
    }

    const payload = {
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    // Preparar datos del usuario para enviar al frontend (sin password)
    const userData = {
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
      isActive: userFound.isActive,
    };

    // Devolver tanto el token como los datos del usuario
    return [{ token: accessToken, user: userData }, null];
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return [null, "Error interno del servidor"];
  }
}


export async function registerService(user) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const { name, email, role = "operator" } = user;

    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message
    });

    const existingEmailUser = await userRepository.findOne({
      where: {
        email,
      },
    });
    
    if (existingEmailUser) return [null, createErrorMessage("email", "Correo electrónico en uso")];

    const newUser = userRepository.create({
      name,
      email,
      passwordHash: await encryptPassword(user.password),
      role,
      isActive: true,
    });

    await userRepository.save(newUser);

    const { passwordHash, ...dataUser } = newUser;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al registrar un usuario", error);
    return [null, "Error interno del servidor"];
  }
}
