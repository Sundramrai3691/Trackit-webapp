import { Router } from "express";
const router = Router();
import { loginUser, signUpUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { logoutUser } from "../controllers/user.controller.js";
import { postItem } from "../controllers/user.controller.js";
import {
  userPosts,
  deletePosts,
  passwordReset,
  forgotPassword,
  verifyEmail,
} from "../controllers/user.controller.js";

// user router

router.route("/signUp").post(signUpUser);
router.route("/verify-Email").post(verifyEmail);
router.route("/login").post(loginUser);
router.route("/auth/refreshAccessToken").post(refreshAccessToken);
router.route("/logout").post(verifyjwt, logoutUser);
router.route("/forgot-password").post(verifyjwt, forgotPassword);
router.route("/password-reset").put(verifyjwt, upload.none(), passwordReset);
router.route("/verify-email").post(verifyEmail)
router.route("/postItems").post(
  verifyjwt,
  upload.fields([
    {
      name: "ImageTrackList",
      maxCount: 2,
    },
  ]),
  postItem
);

router.route("/profile").get(verifyjwt, userPosts);
router.route("/profile/delete").delete(verifyjwt, deletePosts);

const userRouter = router;

export { userRouter };
