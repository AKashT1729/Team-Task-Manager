import { Router } from "express";
import {
  getDashboardOverview,
  getTasksByStatus,
  getTasksPerUser,
  getOverdueTasks,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All dashboard routes require authentication
router.use(verifyJWT);

// Dashboard overview - includes total projects, total tasks, overdue count, status breakdown
router.route("/overview").get(getDashboardOverview);

// Tasks distribution by status
router.route("/tasks-by-status").get(getTasksByStatus);

// Tasks per user (admin only, enforced in controller)
router.route("/tasks-per-user").get(getTasksPerUser);

// Overdue tasks
router.route("/overdue-tasks").get(getOverdueTasks);

export default router;
