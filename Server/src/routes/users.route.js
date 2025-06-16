import { Router } from "express";
import { verifyJWTAuth } from "../middlewares/verifyJWT.middleware.js";
import { verifyRoleAccess } from "../middlewares/verifyRoles.middleware.js";
import {
  applyJobApplication,
  loginUser,
  registerUser,
  updateEmail,
  updatePassword,
  updateProfileInfo,
  updateProfilePicture,
  updateResume,
  updateUserSkills,
  userLogOut,
  userProfile,
  verifyEmail,
  verifyUser,
  viewJobInfo,
} from "../controllers/users.controller.js";
import { uploadLocal } from "../middlewares/multer.middleware.js";

const userRoute = Router();

userRoute
  .route("/register")
  .post(uploadLocal.single("profilepic"), registerUser);
userRoute
  .route("/verify/:token")
  .post(uploadLocal.single("resume"), verifyUser);
userRoute.route("/login").post(loginUser);
userRoute
  .route("/logout")
  .post(verifyJWTAuth, verifyRoleAccess("user"), userLogOut);
userRoute
  .route("/profile")
  .post(verifyJWTAuth, verifyRoleAccess("user"), userProfile);
userRoute
  .route("/updateprofile")
  .patch(verifyJWTAuth, verifyRoleAccess("user"), updateProfileInfo);
userRoute
  .route("/updateskills")
  .patch(verifyJWTAuth, verifyRoleAccess("user"), updateUserSkills);
userRoute
  .route("/updateprofilepic")
  .patch(
    verifyJWTAuth,
    verifyRoleAccess("user"),
    uploadLocal.single("profilePic"),
    updateProfilePicture
  );
userRoute
  .route("/updateresume")
  .patch(
    verifyJWTAuth,
    verifyRoleAccess("user"),
    uploadLocal.single("resume"),
    updateResume
  );
userRoute
  .route("/updatepassword")
  .patch(verifyJWTAuth, verifyRoleAccess("user"), updatePassword);
userRoute
  .route("/updateemail")
  .patch(verifyJWTAuth, verifyRoleAccess("user"), updateEmail);
userRoute
  .route("/verifyemail")
  .get(verifyJWTAuth, verifyRoleAccess("user"), verifyEmail);
userRoute
  .route("/apply/:id")
  .post(verifyJWTAuth, verifyRoleAccess("user"), applyJobApplication);
userRoute
  .route("/apply/:id")
  .delete(verifyJWTAuth, verifyRoleAccess("user"), deleteJobApplication);
userRoute
  .route("/jobdetail/:id")
  .post(verifyJWTAuth, verifyRoleAccess("user"), viewJobInfo);

export { userRoute };
