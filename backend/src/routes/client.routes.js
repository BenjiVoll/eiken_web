"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove, 
  isDesignerOrAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { clientQueryValidation, clientBodyValidation } from "../validations/client.validation.js";
import {
  createClientController as createClient,
  deleteClientController as deleteClient,
  getClientByIdController as getClient,
  getClientsController as getClients,
  updateClientController as updateClient,
} from "../controllers/user.cliente.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .post("/", 
    isDesignerOrAbove, // Designer+ puede crear clientes
    createBodyValidation(clientBodyValidation), 
    createClient
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ puede ver lista de clientes
    createQueryValidation(clientQueryValidation), 
    getClients
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ puede ver detalles de clientes
    createQueryValidation(clientQueryValidation), 
    getClient
  )
  .patch("/:id", 
    isDesignerOrAbove, // Designer+ puede actualizar clientes
    createBodyValidation(clientBodyValidation), 
    updateClient
  )
  .delete("/:id", 
    isManagerOrAbove, // Solo Manager+ puede eliminar clientes
    deleteClient
  );

export default router;
