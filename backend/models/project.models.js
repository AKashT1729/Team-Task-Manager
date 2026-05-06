import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
  },
  { timestamps: true }
);

// Compound index for efficient project membership queries
projectSchema.index({ creator: 1, createdAt: -1 });
projectSchema.index({ members: 1, createdAt: -1 });
projectSchema.index({ admins: 1, createdAt: -1 });

export const Project = mongoose.model("Project", projectSchema);
