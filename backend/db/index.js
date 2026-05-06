import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { DB_NAME } from "../constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env in backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      process.env.MONGODB_URL,
      {
        dbName: DB_NAME,
      }
    );
    console.log(
      `\n✓ Mongoose Connected. DB Host: ${connectInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MongoDB connecting error", error);
    process.exit(1);
  }
};
export default connectDB;
