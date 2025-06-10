import { Router } from "express";
import { verifyJWTAuth } from "../middlewares/verifyJWT.middleware.js";
import { verifyRoleAccess } from "../middlewares/verifyRoles.middleware.js";
import {
  loginUser,
  registerUser,
  verifyUserEmail,
} from "../controllers/user.controller.js";
import { uploadLocal } from "../middlewares/multer.middleware.js";
const userRoute = Router();

userRoute
  .route("/register")
  .post(uploadLocal.single("profilePic"), registerUser);
userRoute.route("/verifyemail").get(verifyUserEmail);
userRoute.route("/login").post(loginUser);

export { userRoute };
