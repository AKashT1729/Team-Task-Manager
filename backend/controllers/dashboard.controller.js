import { Task } from "../models/task.models.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
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

  // Non-admin: only tasks assigned to them
  // Admin: all tasks
  const taskQuery = isGlobalAdmin ? {} : { assignedTo: userId };

  // Get tasks count
  const totalTasks = await Task.countDocuments(taskQuery);

  // Get tasks by status
  const tasksByStatus = await Task.aggregate([
    { $match: taskQuery },
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

  // Get tasks per user (only for admins)
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
          totalTasks: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalTasks: -1 } },
      { $limit: 10 },
    ]);

    // Enrich with pending
    tasksPerUser = tasksPerUser.map((u) => ({
      ...u,
      pending: u.totalTasks - (u.completed || 0),
    }));
  } else {
    // For non-admin, show only their assigned tasks breakdown
    const myTasks = await Task.countDocuments(taskQuery);
    tasksPerUser = [
      {
        _id: userId,
        userName: req.user.name,
        userEmail: req.user.email,
        totalTasks: myTasks,
        pending: null,
        completed: null,
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
 * Admin: sees all tasks
 * Member: sees only tasks assigned to them
 */
const getTasksByStatus = asyncHandler(async (req, res) => {
  const isGlobalAdmin = req.user.role === "admin";
  const userId = req.user._id;

  // Non-admins can only see their assigned tasks
  const matchQuery = isGlobalAdmin ? {} : { assignedTo: userId };

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
 * Admin: sees all users with task counts
 * Member: sees only their own count
 */
const getTasksPerUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isGlobalAdmin = req.user.role === "admin";

  if (!isGlobalAdmin) {
    // For non-admin, return only their own statistics
    const myTaskCount = await Task.countDocuments({
      $or: [
        { assignedTo: userId },
        { createdBy: userId },
      ],
    });

    return res.status(200).json(
      new ApiResponse(200, [
        {
          _id: userId,
          userName: req.user.name,
          userEmail: req.user.email,
          userRole: req.user.role,
          totalTasks: myTaskCount,
          pending: null,
          completed: null,
        },
      ], "Tasks per user fetched successfully")
    );
  }

   // Admin sees all users with task distribution
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
         completed: {
           $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
         },
       },
     },
     { $sort: { totalTasks: -1 } },
     { $limit: 20 },
   ]);

  // Enrich with pending count
  const enriched = result.map((user) => ({
    ...user,
    pending: user.totalTasks - (user.completed || 0),
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, enriched, "Tasks per user fetched successfully"));
});

/**
 * Get overdue tasks
 * Admin: sees all overdue tasks
 * Member: sees only overdue tasks assigned to them
 */
const getOverdueTasks = asyncHandler(async (req, res) => {
  const isGlobalAdmin = req.user.role === "admin";
  const userId = req.user._id;

  // Base query: overdue and not done
  const baseQuery = {
    dueDate: { $lt: new Date() },
    status: { $ne: "done" },
  };

  // Non-admins can only see their assigned overdue tasks
  const matchQuery = isGlobalAdmin ? baseQuery : { ...baseQuery, assignedTo: userId };

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
