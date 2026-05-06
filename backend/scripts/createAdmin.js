import connectDB from "../db/index.js";
import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";

const createAdmin = async () => {
  try {
    await connectDB();

    const email = "thakare.akash007@gmail.com";
    const password = "123456789";
    const name = "Admin User";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("✓ Admin user already exists:", email);
      console.log("  User ID:", existingAdmin._id);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a default avatar URL (placeholder)
    const defaultAvatar = "https://res.cloudinary.com/drnuvaix0/image/upload/v1746423423/default-avatar.png";

    // Create admin user
    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      avatar: defaultAvatar,
      role: "admin",
    });

    // Remove password from output
    const adminSafe = await User.findById(admin._id).select("-password -refreshToken");

    console.log("✓ Admin user created successfully:");
    console.log({
      id: adminSafe._id,
      name: adminSafe.name,
      email: adminSafe.email,
      role: adminSafe.role,
      avatar: adminSafe.avatar,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
