import { Router } from "express";
import { verifyJWTAuth } from "../middlewares/verifyJWT.middleware.js";
import { verifyRoleAccess } from "../middlewares/verifyRoles.middleware.js";
import {
  companyDashboard,
  companyLogOut,
  companyProfile,
  createJobPosting,
  deleteJobPosting,
  getAllJobsPosted,
  getJobApplications,
  loginCompany,
  registerCompany,
  updateApplicationStatus,
  updateCompanyEmail,
  updateCompanyLogo,
  updateCompanyPassword,
  updateCompanyProfileInfo,
  verifyCompany,
  verifyCompanyEmail,
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

companyRoute.use(verifyJWTAuth, verifyRoleAccess("company"));

companyRoute
  .route("/profile")
  .get(companyProfile)
  .patch(updateCompanyProfileInfo);
companyRoute
  .route("/profile/companyLogo")
  .patch(uploadLocal.single("companyLogo"), updateCompanyLogo);

companyRoute.route("/logout").post(companyLogOut);
companyRoute.route("/profile/password").patch(updateCompanyPassword);
companyRoute.route("/profile/email").patch(updateCompanyEmail);
companyRoute.route("/profile/verifyEmail").post(verifyCompanyEmail);
companyRoute.route("/jobs").get(getAllJobsPosted).post(createJobPosting);
companyRoute.route("/jobs/:jobID").delete(deleteJobPosting);
companyRoute.route("/jobs/:jobID/applications").get(getJobApplications);
companyRoute.route("/application/:id").post(updateApplicationStatus);
companyRoute.route("/dashboard").get(companyDashboard);

export { companyRoute };
