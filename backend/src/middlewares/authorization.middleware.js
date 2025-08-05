import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
handleErrorClient,
handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function isAdmin(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const userFound = await userRepository.findOneBy({ email: req.user.email });
    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }
    const userRole = userFound.role;
    if (userRole !== "admin") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de administrador para realizar esta acción."
      );
    }
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}


// CRUD solo admin y manager
export async function isAdminOrManager(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const userFound = await userRepository.findOneBy({ email: req.user.email });
    if (!userFound) {
      return handleErrorClient(res, 404, "Usuario no encontrado en la base de datos");
    }
    const allowedRoles = ["admin", "manager"];
    if (!allowedRoles.includes(userFound.role)) {
      return handleErrorClient(res, 403, "Error al acceder al recurso", "Solo admin y manager pueden realizar esta acción.");
    }
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// GET para todos los roles
export async function isAnyUser(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const userFound = await userRepository.findOneBy({ email: req.user.email });
    if (!userFound) {
      return handleErrorClient(res, 404, "Usuario no encontrado en la base de datos");
    }
    const allowedRoles = ["admin", "manager", "designer", "operator"];
    if (!allowedRoles.includes(userFound.role)) {
      return handleErrorClient(res, 403, "Error al acceder al recurso", "No tienes permisos para acceder a este recurso.");
    }
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function isOwnerOrManagerAbove(req, res, next) {
try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
    return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
    );
    }

    const userRole = userFound.role;
    const allowedRoles = ["admin", "manager", "operator"];
    const resourceUserId = req.params.id;

    // Si es admin o manager, puede acceder a cualquier recurso
    if (allowedRoles.includes(userRole)) {
        return next();
    }

    // Si no es admin/manager, solo puede acceder a sus propios recursos
    if (userFound.id.toString() === resourceUserId) {
        return next();
    }

    return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Solo puedes acceder a tus propios recursos o necesitas permisos de manager."
    );
} catch (error) {
    handleErrorServer(
    res,
    500,
    error.message,
    );
}
}