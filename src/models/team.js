import mongoose from "mongoose";

const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", teamSchema);
