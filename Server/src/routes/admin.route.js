import { Router } from "express";
import {
  adminDashboard,
  deleteCompanyByAdmin,
  deleteUserByAdmin,
  getAllCompanies,
  getAllUsers,
  getSingleCompany,
  getSingleUser,
  loginAdmin,
  logoutAdmin,
  searchCompanies,
  searchUsers,
  updateCompanyByAdmin,
  updateCompanyStatus,
  updateUserByAdmin,
} from "../controllers/admins.controller.js";
import { verifyJWTAuth } from "../middlewares/verifyJWT.middleware.js";
import { verifyRoleAccess } from "../middlewares/verifyRoles.middleware.js";

const adminRoute = Router();

adminRoute.route("/login").post(loginAdmin);

adminRoute.use(verifyJWTAuth, verifyRoleAccess("admin"));
adminRoute.route("/users").get(getAllUsers);
adminRoute.route("/users/search").get(searchUsers);
adminRoute
  .route("/users/:userID")
  .delete(deleteUserByAdmin)
  .get(getSingleUser)
  .put(updateUserByAdmin);
adminRoute.route("/companies").get(getAllCompanies);
adminRoute.route("/companies/search").get(searchCompanies);
adminRoute
  .route("/companies/:companyID")
  .delete(deleteCompanyByAdmin)
  .get(getSingleCompany)
  .patch(updateCompanyStatus)
  .put(updateCompanyByAdmin);
adminRoute.route("/dashboard").get(adminDashboard);
adminRoute.route("/logout").post(logoutAdmin);

export { adminRoute };
