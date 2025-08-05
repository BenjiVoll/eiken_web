"use strict";
import { Router } from "express";
import { 
  isAdminOrManager, 
  isAnyUser 
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
    isAdminOrManager,
    createBodyValidation(clientBodyValidation), 
    createClient
  )
  .get("/", 
    isAnyUser,
    getClients
  )
  .get("/:id", 
    isAnyUser,
    createQueryValidation(clientQueryValidation), 
    getClient
  )
  .patch("/:id", 
    isAdminOrManager,
    createBodyValidation(clientBodyValidation), 
    updateClient
  )
  .delete("/:id", 
    isAdminOrManager,
    deleteClient
  );

export default router;
