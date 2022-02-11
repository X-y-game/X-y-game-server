import mongoose from "mongoose";

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    teams: [{ type: mongoose.Types.ObjectId, ref: "Team" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", roomSchema);
