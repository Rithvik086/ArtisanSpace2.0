import mongoose, { Types } from "mongoose";

const customRequestSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: String,
    required: true,
  },
  requiredBy: {
    type: String,
    required: true,
  },
  artisanId: {
    type: Types.ObjectId,
    ref: "User",
    default: null,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  isValid: {
    type: Boolean,
    default: true,
  },
});

// Pre-save middleware to update updatedAt on every save
customRequestSchema.pre("save", function (next) {
  this.updatedAt = new Date().toISOString();
  next();
});

// Pre-update middleware to update updatedAt on findOneAndUpdate operations
customRequestSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date().toISOString() });
  next();
});

export default mongoose.model("Request", customRequestSchema);
