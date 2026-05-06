import Task from "../models/task.models.js";
import Project from "../models/project.models.js";
import User from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get dashboard overview statistics
 * Admin: sees all data
 * Member: sees only their assigned tasks and projects they're part of
 */
const getDashboardOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isGlobalAdmin = req.user.role === "admin";

  // Build base query based on role
  const projectQuery = isGlobalAdmin
    ? {}
    : { $or: [{ creator: userId }, { admins: userId }, { members: userId }] };

  // Get projects count
  const projectsCount = await Project.countDocuments(projectQuery);

  // Build task query
  let taskQuery = {};
  if (!isGlobalAdmin) {
    // Get projects where user is member
    const userProjects = await Project.find(projectQuery).select("_id");
    const projectIds = userProjects.map((p) => p._id);
    taskQuery = {
      $or: [
        { assignedTo: userId },
        { project: { $in: projectIds } },
        { createdBy: userId },
      ],
    };
  }

  // Get tasks count
  const totalTasks = await Task.countDocuments(taskQuery);

  // Get tasks by status
  const tasksByStatus = await Task.aggregate([
    { $match: isGlobalAdmin ? {} : taskQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get overdue tasks count
  const overdueTasks = await Task.countDocuments({
    ...taskQuery,
    dueDate: { $lt: new Date() },
    status: { $ne: "done" },
  });

  // Get tasks per user (only for admins or users with project membership)
  let tasksPerUser = [];
  if (isGlobalAdmin) {
    tasksPerUser = await Task.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$assignedUser._id",
          userName: { $first: "$assignedUser.name" },
          userEmail: { $first: "$assignedUser.email" },
          taskCount: { $sum: 1 },
        },
      },
      { $sort: { taskCount: -1 } },
      { $limit: 10 },
    ]);
  } else {
    // For non-admin, show only their assigned tasks breakdown
    const myTasks = await Task.countDocuments({
      ...taskQuery,
      assignedTo: userId,
    });
    tasksPerUser = [
      {
        _id: userId,
        userName: req.user.name,
        userEmail: req.user.email,
        taskCount: myTasks,
      },
    ];
  }

  // Get recent activity (last 7 days tasks)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const recentTasks = await Task.find({
    ...taskQuery,
    createdAt: { $gte: lastWeek },
  })
    .populate("assignedTo", "name email")
    .populate("project", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(200).json(
    new ApiResponse(200, {
      totalProjects: projectsCount,
      totalTasks,
      overdueTasks,
      tasksByStatus: {
        todo: tasksByStatus.find((s) => s._id === "todo")?.count || 0,
        "in-progress": tasksByStatus.find((s) => s._id === "in-progress")?.count || 0,
        review: tasksByStatus.find((s) => s._id === "review")?.count || 0,
        done: tasksByStatus.find((s) => s._id === "done")?.count || 0,
      },
      tasksPerUser,
      recentActivity: recentTasks,
    }, "Dashboard overview fetched successfully")
  );
});

/**
 * Get tasks by status distribution
 */
const getTasksByStatus = asyncHandler(async (req, res) => {
  const isGlobalAdmin = req.user.role === "admin";
  const userId = req.user._id;

  let matchQuery = {};
  if (!isGlobalAdmin) {
    const userProjects = await Project.find({
      $or: [{ creator: userId }, { admins: userId }, { members: userId }],
    }).select("_id");
    const projectIds = userProjects.map((p) => p._id);
    matchQuery = {
      $or: [
        { assignedTo: userId },
        { project: { $in: projectIds } },
        { createdBy: userId },
      ],
    };
  }

  const result = await Task.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks by status fetched successfully"));
});

/**
 * Get tasks per user statistics
 */
const getTasksPerUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can view tasks per user");
  }

  const result = await Task.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedUser",
      },
    },
    { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$assignedUser._id",
        userName: { $first: "$assignedUser.name" },
        userEmail: { $first: "$assignedUser.email" },
        userRole: { $first: "$assignedUser.role" },
        totalTasks: { $sum: 1 },
        pending: {
          $sum: {
            $cond: [{ $in: ["$status", ["todo", "in-progress", "review"]] }, 1, 0],
          },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
        },
      },
    },
    { $sort: { totalTasks: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks per user fetched successfully"));
});

/**
 * Get overdue tasks
 */
const getOverdueTasks = asyncHandler(async (req, res) => {
  const isGlobalAdmin = req.user.role === "admin";
  const userId = req.user._id;

  let matchQuery = {
    dueDate: { $lt: new Date() },
    status: { $ne: "done" },
  };

  if (!isGlobalAdmin) {
    const userProjects = await Project.find({
      $or: [{ creator: userId }, { admins: userId }, { members: userId }],
    }).select("_id");
    const projectIds = userProjects.map((p) => p._id);
    matchQuery = {
      ...matchQuery,
      $or: [
        { assignedTo: userId },
        { project: { $in: projectIds } },
        { createdBy: userId },
      ],
    };
  }

  const tasks = await Task.find(matchQuery)
    .populate("assignedTo", "name email avatar")
    .populate("project", "name")
    .populate("createdBy", "name email")
    .sort({ dueDate: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Overdue tasks fetched successfully"));
});

export {
  getDashboardOverview,
  getTasksByStatus,
  getTasksPerUser,
  getOverdueTasks,
};
