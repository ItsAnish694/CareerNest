import { Router } from "express";
import { loginAdmin } from "../controllers/admins.controller.js";

const adminRoute = Router();

adminRoute.route("/login").post(loginAdmin);

export { adminRoute };
