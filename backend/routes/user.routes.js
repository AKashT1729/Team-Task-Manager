import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentuser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateUserAvatar,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/role.middleware.js";
const router = Router();

// Admin-only user registration
router.route("/register").post(
  verifyJWT,
  isAdmin,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    }
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentuser);
router
  .route("/avatar-upload")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Admin user management routes
router.route("/admin/users").get(verifyJWT, isAdmin, getAllUsers);
router.route("/admin/users/:userId").get(verifyJWT, isAdmin, getUserById);
router
  .route("/admin/users/:userId/role")
  .patch(verifyJWT, isAdmin, updateUserRole);
router.route("/admin/users/:userId").delete(verifyJWT, isAdmin, deleteUser);

export default router;