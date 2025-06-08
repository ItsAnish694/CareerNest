import { Router } from "express";
import { verifyJWTAuth } from "../middlewares/authJWT.middleware.js";
import { verifyRoleAccess } from "../middlewares/verifyRole.middleware.js";
import {} from "../controllers/user.controller.js";
const userRoute = Router();

export { userRoute };
