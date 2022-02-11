import mongoose from "mongoose";

const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", teamSchema);
