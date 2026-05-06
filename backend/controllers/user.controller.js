import User from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

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
  //get user details from frontend
  //validation - check field is not empty
  //check if user already exists : email
  //check for images , check avatar
  //upload them into cloudinary ,avatar
  //create user object - create entry in database
  //remove password and refresh token field from response
  //check for user creation
  //retun response

  const { name, email,role, password } = req.body;
  //console.log(fullName, email);

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Please fill all the fields");
  }

  const userExists = await User.findOne({
    $or: [{ email }],
  });
  if (userExists) {
    throw new ApiError(409, "User already exists");
  }
  // console.log(req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path; //ensures that if req.files is null or undefined, the code doesn't throw an error but instead returns undefined

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an avatar");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // console.log(avatar);
  if (!avatar) {
    throw new ApiError(400, "Please upload an avatar");
  }

  const user = await User.create({
    email,
    password,
    avatar: avatar,
    role: role || "user", // Set default role if not provided
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
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
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
        "user logged in successfully"
      )
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
    { new: true }
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

export { generateAccessAndRefereshTokens, registerUser, loginUser, logOutUser };
