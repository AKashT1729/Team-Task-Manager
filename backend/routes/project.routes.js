import { Router } from "express";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  addProjectMember,
  removeProjectMember,
  deleteProject,
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  isProjectAdmin,
  isProjectMember,
  isAdmin,
} from "../middlewares/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Project routes
router.route("/").post(createProject); // Create project - creator becomes admin
router.route("/my-projects").get(getUserProjects); // Get user's projects
router.route("/:projectId").get(isProjectMember, getProjectById); // Get single project (members only)
router.route("/:projectId").patch(isProjectAdmin, updateProject); // Update project (admin only)
router.route("/:projectId").delete(isProjectAdmin, deleteProject); // Delete project (admin/creator only)

// Member management routes
router
  .route("/:projectId/members")
  .post(isProjectAdmin, addProjectMember); // Add member (admin only)

router
  .route("/:projectId/members/:userId")
  .delete(isProjectAdmin, removeProjectMember); // Remove member (admin only)

export default router;
