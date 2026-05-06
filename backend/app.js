import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Handle 404 for unmatched routes
app.use((req, res, next) => {
  throw new ApiError(404, `Route ${req.method} ${req.path} not found`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // If error is already an ApiError, use its properties
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      data: err.data || null,
      message: err.message,
      success: false,
      errors: err.errors || [],
    });
  }

  // For unexpected errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    success: false,
    errors: [],
  });
});

export { app };
