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

(productSchema as any).pre(
  "deleteOne",
  { query: true },
  async function (this: any, next: (err?: any) => void) {
    const productId = this.getFilter()._id;
    if (!productId) return next();

    try {
      await Cart.updateMany(
        { "products.productId": productId },
        { $pull: { products: { productId } } }
      );
      next();
    } catch (error) {
      next(error as any);
    }
  }
);

(productSchema as any).pre(
  "save",
  async function (this: any, next: (err?: any) => void) {
    if (this.isValid === false && this.isModified('isValid')) {
      try {
        await Cart.updateMany(
          { "products.productId": this._id },
          { $pull: { products: { productId: this._id } } }
        );
      } catch (error) {
        return next(error as any);
      }
    }
    next();
  }
);

export default mongoose.model("Product", productSchema);
