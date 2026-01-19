import mongoose from "mongoose";
import { Types } from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
  },

  products: [
    {
      productId: {
        type: Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not a valid number",
        },
      },
    },
  ],
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

// Pre-save middleware to update updatedAt on every save
cartSchema.pre("save", function (next) {
  this.updatedAt = new Date().toISOString();
  next();
});

// Pre-update middleware to update updatedAt on findOneAndUpdate operations
cartSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date().toISOString() });
  next();
});

export default mongoose.model("Cart", cartSchema);
