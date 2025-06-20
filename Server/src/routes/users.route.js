import { Router } from "express";
import { verifyJWTAuth } from "../middlewares/verifyJWT.middleware.js";
import { verifyRoleAccess } from "../middlewares/verifyRoles.middleware.js";
import {
  addBookmarkJob,
  applyJobApplication,
  deleteBookmarkJob,
  deleteJobApplication,
  getAllJobs,
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
  .post(uploadLocal.single("profilePic"), registerUser);
userRoute
  .route("/verify/:token")
  .post(uploadLocal.single("resume"), verifyUser);
userRoute.route("/login").post(loginUser);

userRoute.use(verifyJWTAuth, verifyRoleAccess("user"));

userRoute.route("/logout").post(userLogOut);
userRoute.route("/profile").get(userProfile).patch(updateProfileInfo);
userRoute.route("/profile/skills").patch(updateUserSkills);

userRoute
  .route("/profile/profilePic")
  .patch(uploadLocal.single("profilePic"), updateProfilePicture);
userRoute
  .route("/profile/resume")
  .patch(uploadLocal.single("resume"), updateResume);

userRoute.route("/profile/password").patch(updatePassword);
userRoute.route("/profile/email").patch(updateEmail);
userRoute.route("/profile/verifyEmail").post(verifyEmail);
userRoute.route("/jobs").get(getAllJobs);

userRoute
  .route("/jobs/:id")
  .get(viewJobInfo)
  .post(applyJobApplication)
  .delete(deleteJobApplication);

userRoute.route("/bookmark/:id").post(addBookmarkJob).delete(deleteBookmarkJob);

export { userRoute };
