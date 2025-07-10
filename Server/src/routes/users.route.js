import { Router } from "express";
import { verifyJWTAuth } from "../middlewares/verifyJWT.middleware.js";
import { verifyRoleAccess } from "../middlewares/verifyRoles.middleware.js";
import {
  addBookmarkJob,
  applyJobApplication,
  deleteBookmarkJob,
  deleteJobApplication,
  deleteUserAccount,
  getAllBookmarks,
  getAllJobsDetails,
  getAppliedJobs,
  homePage,
  loginUser,
  registerUser,
  searchJobs,
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

//Profile Related Routes
userRoute
  .route("/profile/profilePic")
  .patch(uploadLocal.single("profilePic"), updateProfilePicture);
userRoute
  .route("/profile/resume")
  .patch(uploadLocal.single("resume"), updateResume);
userRoute.route("/profile/password").patch(updatePassword);
userRoute.route("/profile/email").patch(updateEmail);
userRoute.route("/profile/verifyEmail").post(verifyEmail);
userRoute.route("/profile").get(userProfile).patch(updateProfileInfo);
userRoute.route("/profile/skills").patch(updateUserSkills);
userRoute.route("/profile/deleteAccount").delete(deleteUserAccount);

//Application Related Routes
userRoute
  .route("/applications/:jobID")
  .post(applyJobApplication)
  .delete(deleteJobApplication);
userRoute.route("/applications").get(getAppliedJobs);

//Bookmark Related Routes
userRoute
  .route("/bookmarks/:jobID")
  .post(addBookmarkJob)
  .delete(deleteBookmarkJob);
userRoute.route("/bookmarks").get(getAllBookmarks);

userRoute.route("/search").get(searchJobs);
userRoute.route("/home").get(homePage);
userRoute.route("/jobs").get(getAllJobsDetails);
userRoute.route("/logout").post(userLogOut);

export { userRoute };
