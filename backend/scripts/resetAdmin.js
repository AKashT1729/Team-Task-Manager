import connectDB from "../db/index.js";
import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";

const resetAdmin = async () => {
  try {
    await connectDB();

    const email = "thakare.akash@gmail.com";
    const password = "123456789";
    const name = "Admin User";

    // Delete existing admin user
    await User.deleteOne({ email });

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

    console.log("✓ Admin user reset successfully:");
    console.log({
      id: adminSafe._id,
      name: adminSafe.name,
      email: adminSafe.email,
      role: adminSafe.role,
      avatar: adminSafe.avatar,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error resetting admin:", error);
    process.exit(1);
  }
};

resetAdmin();