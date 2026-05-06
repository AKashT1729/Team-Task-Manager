import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Validate user signup data
 */
export const validateUserSignup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(", "));
  }

  next();
});

/**
 * Validate user login data
 */
export const validateUserLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(", "));
  }

  next();
});

/**
 * Sanitize user input
 */
export const sanitizeUserInput = (req, res, next) => {
  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();
  next();
};

/**
 * Validate project data
 */
export const validateProject = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push("Project name must be at least 3 characters");
  }

  if (name && name.trim().length > 100) {
    errors.push("Project name cannot exceed 100 characters");
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(", "));
  }

  next();
});

/**
 * Validate task data
 */
export const validateTask = asyncHandler(async (req, res, next) => {
  const { title, assignedTo, priority, status } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push("Task title must be at least 3 characters");
  }

  if (title && title.trim().length > 200) {
    errors.push("Task title cannot exceed 200 characters");
  }

  if (priority && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be low, medium, or high");
  }

  if (status && !["todo", "in-progress", "review", "done"].includes(status)) {
    errors.push("Status must be todo, in-progress, review, or done");
  }

  if (assignedTo) {
    const user = await User.findById(assignedTo);
    if (!user) {
      errors.push("Assigned user not found");
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(", "));
  }

  next();
});

/**
 * Validate user login data
 */
export const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  next();
};

/**
 * Sanitize user input (trim whitespace, lowercase email)
 */
export const sanitizeUserInput = (req, res, next) => {
  if (req.body.name) {
    req.body.name = req.body.name.trim();
  }
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  next();
};

/**
 * Validate project creation/update
 */
export const validateProject = async (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push("Project name must be at least 3 characters");
  }

  if (name && name.trim().length > 100) {
    errors.push("Project name cannot exceed 100 characters");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  next();
};

/**
 * Validate task creation/update
 */
export const validateTask = async (req, res, next) => {
  const { title, assignedTo, priority, status, dueDate } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push("Task title must be at least 3 characters");
  }

  if (title && title.trim().length > 200) {
    errors.push("Task title cannot exceed 200 characters");
  }

  if (priority && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be low, medium, or high");
  }

  if (status && !["todo", "in-progress", "review", "done"].includes(status)) {
    errors.push("Status must be todo, in-progress, review, or done");
  }

  if (assignedTo) {
    const user = await User.findById(assignedTo);
    if (!user) {
      errors.push("Assigned user not found");
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  next();
};
