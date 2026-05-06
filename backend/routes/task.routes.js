import { Router } from "express";
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  isProjectMember,
  isProjectAdmin,
  canAccessTask,
} from "../middlewares/role.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Task routes within a project
router
  .route("/projects/:projectId/tasks")
  .post(isProjectAdmin, createTask) // Create task (project admin only)
  .get(isProjectMember, getProjectTasks); // Get all project tasks (project member - filtered by role)

// Individual task routes
router
  .route("/projects/:projectId/tasks/:taskId")
  .get(canAccessTask, getTaskById) // Get single task (assigned or admin)
  .patch(canAccessTask, updateTask) // Update task (assigned user can update status, admins can update all)
  .delete(isProjectAdmin, deleteTask); // Delete task (project admin only)

export default router;
