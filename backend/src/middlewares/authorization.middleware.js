import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
handleErrorClient,
handleErrorServer,
} from "../handlers/responseHandlers.js";

// Middleware para verificar si el usuario es administrador
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

// Middleware para verificar si el usuario es manager o superior
export async function isManagerOrAbove(req, res, next) {
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
    const allowedRoles = ["admin", "manager"];

    if (!allowedRoles.includes(userRole)) {
        return handleErrorClient(
            res,
            403,
            "Error al acceder al recurso",
            "Se requiere un rol de manager o superior para realizar esta acción."
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

// Middleware para verificar si el usuario es designer o superior
export async function isDesignerOrAbove(req, res, next) {
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
    const allowedRoles = ["admin", "manager", "designer"];

    if (!allowedRoles.includes(userRole)) {
        return handleErrorClient(
            res,
            403,
            "Error al acceder al recurso",
            "Se requiere un rol de designer o superior para realizar esta acción."
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

// Middleware para verificar si el usuario puede acceder a sus propios recursos o es manager+
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
    const allowedRoles = ["admin", "manager"];
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