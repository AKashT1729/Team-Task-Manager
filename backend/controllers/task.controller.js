import { Task } from "../models/task.models.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create task in project (admin/creator only)
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, priority, dueDate } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Task title is required");
  }

  // Project is already verified and populated by isProjectAdmin middleware
  const project = req.project;

  const userId = req.user._id;

  // Validate assignedTo user exists and is project member if provided
  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      throw new ApiError(404, "Assigned user not found");
    }

    const isMember =
      project.members.some((m) => m.toString() === assignedTo) ||
      project.creator.toString() === assignedTo ||
      project.admins.some((a) => a.toString() === assignedTo);

    if (!isMember) {
      throw new ApiError(400, "Assigned user must be a project member");
    }
  }

  const task = await Task.create({
    title,
    description,
    project: project._id,
    assignedTo: assignedTo || null,
    createdBy: userId,
    priority: priority || "medium",
    dueDate: dueDate || null,
  });

  const populatedTask = await Task.findById(task._id)
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar")
    .populate("project", "name");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedTask, "Task created successfully"));
});

/**
 * Get all tasks for a project (members only - filtered by role)
 */
const getProjectTasks = asyncHandler(async (req, res) => {
  // Project is already populated by isProjectMember middleware
  const project = req.project;

  const userId = req.user._id;
  let isAdmin =
    project.creator.toString() === userId.toString() ||
    project.admins.some((adminId) => adminId.toString() === userId.toString());

  // Global admins have full visibility
  if (req.user.role === "admin") {
    isAdmin = true;
  }

  // Build query: admins see all tasks, members see only tasks assigned to them
  const query = { project: project._id };
  if (!isAdmin) {
    query.assignedTo = userId;
  }

  const tasks = await Task.find(query)
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar")
    .populate("project", "name")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

/**
 * Get single task (only assigned user or project admin/creator)
 */
const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findOne({ _id: taskId, project: projectId })
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar")
    .populate("project", "name");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
});

/**
 * Update task (assigned user can update status, admins can update everything)
 */
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, assignedTo, status, priority, dueDate } = req.body;

  // Fetch task with project for permission check (no populate to keep raw ObjectIds)
  const task = await Task.findOne({ _id: taskId }).populate("project");
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

  // Admin/creator can update any field
  if (isProjectAdmin || isCreator) {
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) {
      // Validate that the new assignee is a project member
      if (assignedTo) {
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
          throw new ApiError(404, "Assigned user not found");
        }
        const isMember =
          task.project.members.some((m) => m.toString() === assignedTo) ||
          task.project.creator.toString() === assignedTo ||
          task.project.admins.some((a) => a.toString() === assignedTo);
        if (!isMember) {
          throw new ApiError(400, "Assigned user must be a project member");
        }
      }
      task.assignedTo = assignedTo;
    }
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status) task.status = status;
  }
  // Assigned user can only update status
  else if (isAssigned) {
    if (status) task.status = status;
    if (description !== undefined) task.description = description;
    // Prevent assigned user from changing other fields
    if (title || assignedTo || priority || dueDate) {
      throw new ApiError(403, "You can only update status and description");
    }
  } else {
    throw new ApiError(403, "You do not have permission to update this task");
  }

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar")
    .populate("project", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

/**
 * Delete task (project admin/creator only)
 */
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  // Project is already verified by isProjectAdmin middleware
  const project = req.project;

  const task = await Task.findOne({ _id: taskId, project: project._id });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await Task.findByIdAndDelete(taskId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
