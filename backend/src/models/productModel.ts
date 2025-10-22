import mongoose from "mongoose";
import { Types } from "mongoose";
import Cart from "./cartModel.js";

const productSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  uploadedBy: {
    type: String,
    required: true,
    enum: {
      values: ["artisan", "manager"],
      message: "{VALUE} is not allowed to upload products.",
    },
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true,
  },
  image: { type: String, required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  quantity: {
    type: Number,
    default: 1,
    validate: {
      validator: Number.isInteger,
      mesage: "{VALUE} is not a valid number",
    },
  },
  description: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: {
      values: ["approved", "pending", "disapproved"],
      message: "{VALUE} is not a valid status",
    },
  },
});

// Use `any` for `this` in mongoose middleware to avoid strict typing issues here
productSchema.pre(
  "deleteOne",
  { document: true, query: true },
  async function (this: any, next: any) {
    try {
      await Promise.all([Cart.deleteMany({ productId: this._id })]);
      next();
    } catch (error) {
      next(error);
    }
  }
);

export default mongoose.model("Product", productSchema);
