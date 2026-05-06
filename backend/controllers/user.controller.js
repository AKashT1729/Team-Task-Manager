import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Error generating while generating refresh tokens and access tokens",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Please fill all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an avatar");
  }
  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUrl) {
    throw new ApiError(400, "Error uploading avatar");
  }

  const user = await User.create({
    email,
    password,
    avatar: avatarUrl,
    role: "user",
  });

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createUser) {
    throw ApiError(500, "User not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get login user details from frontend email and password
  //check if user is already registered or not
  //if yes,then login user
  //then check user password
  //if password is incorrect, then return error message
  //if password is correct, then create access token and refresh token return it
  //send cookie
  //retun response
  const { email, password } = req.body;
  // console.log(username, password);
  if (!email) {
    throw new ApiError(400, "email is required");
  }
  const user = await User.findOne({
    $or: [{ email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const optons = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, optons)
    .cookie("refreshToken", refreshToken, optons)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully",
      ),
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true },
  );
  const optons = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", optons)
    .clearCookie("refreshToken", optons)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }
    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      const user = await User.findById(decodedToken?._id);
      if (!user) {
        throw new ApiError(401, "unauthorized request");
      }
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired ");
      }
      const options = {
        httpOnly: true,
        secure: true,
      };
      const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(user._id);
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            "refresh token refreshed successfully",
          ),
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentuser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUrl) {
    throw new ApiError(400, "Error uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatarUrl } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

/**
 * Get all users (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

/**
 * Get user by ID (Admin or self)
 */
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Allow admin or the user themselves
  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "You can only view your own profile");
  }

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

/**
 * Update user role (Admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;
  await user.save();

  const updatedUser = await User.findById(userId).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User role updated successfully"));
});

/**
 * Delete user (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Prevent admin from deleting themselves via this endpoint
  if (req.user._id.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot delete your own account through admin endpoint");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Reassign or clear tasks assigned to this user
  await Task.updateMany(
    { assignedTo: userId },
    { $set: { assignedTo: null } }
  );

  // Remove user from all projects
  await Project.updateMany(
    { members: userId },
    { $pull: { members: userId } }
  );
  await Project.updateMany(
    { admins: userId },
    { $pull: { admins: userId } }
  );

  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  generateAccessAndRefereshTokens,
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentuser,
  updateUserAvatar,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  changeCurrentPassword,
};
