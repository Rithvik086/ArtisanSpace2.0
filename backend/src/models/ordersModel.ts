import mongoose, { Types } from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  deliveryPersonId: {
    type: Types.ObjectId,
    ref: "User",
    default: null,
  },
  products: [
    {
      productId: {
        name: String,
        category: String,
        material: String,
        image: String,
        oldPrice: Number,
        newPrice: Number,
        quantity: Number,
        description: String,
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
  money: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "shipped", "delivered", "cancelled"],
  },
  paymentId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed"],
    default: "unpaid",
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

export default mongoose.model("Order", orderSchema);
