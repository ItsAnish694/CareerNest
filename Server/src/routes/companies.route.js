import { Router } from "express";
import {
  loginCompany,
  registerCompany,
  verifyCompany,
} from "../controllers/companies.controller.js";
import { uploadLocal } from "../middlewares/multer.middleware.js";

const companyRoute = Router();

companyRoute
  .route("/register")
  .post(uploadLocal.single("companyLogo"), registerCompany);
companyRoute
  .route("/verify/:token")
  .post(uploadLocal.single("document"), verifyCompany);
companyRoute.route("/login").post(uploadLocal.none(), loginCompany);

export { companyRoute };
