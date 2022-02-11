import mongoose, { Schema } from "mongoose";

const { schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  socket_id: String,
});

export default mongoose.model("User", userSchema);
