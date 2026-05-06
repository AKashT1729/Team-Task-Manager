import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
  next();
});

/**
 * Middleware to check if user is project admin or creator
 * Global admins also have project admin rights.
 */
export const isProjectAdmin = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const userId = req.user._id;
  const isProjectAdmin =
    project.creator.toString() === userId.toString() ||
    project.admins.some((adminId) => adminId.toString() === userId.toString());

  if (req.user.role === "admin" || isProjectAdmin) {
    req.project = project;
    return next();
  }

  throw new ApiError(403, "Project admin access required");
});

/**
 * Middleware to check if user is a member of the project
 * Global admins have access to all projects.
 */
export const isProjectMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Grant access to global admins
  if (req.user.role === "admin") {
    req.project = project;
    return next();
  }

  const userId = req.user._id;
  const isMember =
    project.creator.toString() === userId.toString() ||
    project.admins.some((adminId) => adminId.toString() === userId.toString()) ||
    project.members.some((memberId) => memberId.toString() === userId.toString());

  if (isMember) {
    req.project = project;
    return next();
  }

  throw new ApiError(403, "Project member access required");
});

/**
 * Middleware to check if user can access task (assigned to them or is project admin/creator)
 * Global admins have access to all tasks.
 */
export const canAccessTask = asyncHandler(async (req, res, next) => {
  const { projectId, taskId } = req.params;

  // Global admin gets full access - fetch with minimal population
  if (req.user.role === "admin") {
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      throw new ApiError(404, "Task not found");
    }
    req.task = task;
    return next();
  }

  // For non-admins: fetch task with project for permission check
  const task = await Task.findOne({ _id: taskId, project: projectId })
    .populate("project");
    
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const userId = req.user._id;
  const isProjectAdmin =
    task.project.creator.toString() === userId.toString() ||
    task.project.admins.some(
      (adminId) => adminId.toString() === userId.toString()
    );

  const isAssigned = task.assignedTo && task.assignedTo.toString() === userId.toString();
  const isCreator = task.createdBy.toString() === userId.toString();

  if (!isProjectAdmin && !isAssigned && !isCreator) {
    throw new ApiError(403, "You do not have access to this task");
  }

  // Store the raw task (unpopulated except project) for controller use
  req.task = task;
  next();
});
