import mongoose, { Types } from "mongoose";

const ticketSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  subject: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["open", "in-progress", "closed"],
      message: "{VALUE} is not a valid status",
    },
    default: "open",
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

export default mongoose.model("Ticket", ticketSchema);
