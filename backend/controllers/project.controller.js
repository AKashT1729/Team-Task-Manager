import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create a new project - creator becomes admin
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Project name is required");
  }

  const userId = req.user._id;

  const project = await Project.create({
    name,
    description,
    creator: userId,
    admins: [userId],
    members: [userId],
  });

  const populatedProject = await Project.findById(project._id)
    .populate("creator", "name email avatar")
    .populate("admins", "name email avatar")
    .populate("members", "name email avatar");

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedProject, "Project created successfully")
    );
});

/**
 * Get all projects for the logged-in user
 */
const getUserProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const projects = await Project.find({
    $or: [
      { creator: userId },
      { admins: userId },
      { members: userId },
    ],
  })
    .populate("creator", "name email avatar")
    .populate("admins", "name email avatar")
    .populate("members", "name email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

/**
 * Get single project by ID
 */
const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate("creator", "name email avatar")
    .populate("admins", "name email avatar")
    .populate("members", "name email avatar");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

/**
 * Update project details
 */
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Project is already checked and populated by isProjectAdmin middleware
  const project = req.project;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;

  await project.save();

  const updatedProject = await Project.findById(project._id)
    .populate("creator", "name email avatar")
    .populate("admins", "name email avatar")
    .populate("members", "name email avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProject, "Project updated successfully"));
});

/**
 * Add member to project (admin only)
 */
const addProjectMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Project is already checked and populated by isProjectAdmin middleware
  const project = req.project;

  const userToAdd = await User.findById(userId);
  if (!userToAdd) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is already a member
  const isAlreadyMember =
    project.members.some((m) => m.toString() === userId) ||
    project.creator.toString() === userId;

  if (isAlreadyMember) {
    throw new ApiError(409, "User is already a project member");
  }

  project.members.push(userId);
  await project.save();

  const updatedProject = await Project.findById(project._id)
    .populate("creator", "name email avatar")
    .populate("admins", "name email avatar")
    .populate("members", "name email avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProject, "Member added successfully")
    );
});

/**
 * Remove member from project (admin only)
 */
const removeProjectMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Project is already checked and populated by isProjectAdmin middleware
  const project = req.project;

  // Prevent removing creator
  if (project.creator.toString() === userId) {
    throw new ApiError(400, "Cannot remove project creator");
  }

  // Remove from members array
  project.members = project.members.filter(
    (m) => m.toString() !== userId
  );

  // Remove from admins array if present
  project.admins = project.admins.filter(
    (a) => a.toString() !== userId
  );

  await project.save();

  const updatedProject = await Project.findById(project._id)
    .populate("creator", "name email avatar")
    .populate("admins", "name email avatar")
    .populate("members", "name email avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProject, "Member removed successfully")
    );
});

/**
 * Delete project (creator only)
 */
const deleteProject = asyncHandler(async (req, res) => {
  // Project is already checked by isProjectAdmin middleware
  const project = req.project;

  // Only creator can delete project
  if (project.creator.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only project creator can delete the project");
  }

  await Project.findByIdAndDelete(project._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

export {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  addProjectMember,
  removeProjectMember,
  deleteProject,
};
