import mongoose from "mongoose";
import Product from "./productModel.js";
import Cart from "./cartModel.js";
import Ticket from "./supportTicketModel.js";
import Workshop from "./workshopModel.js";
import Request from "./customRequestModel.js";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile_no: {
    type: String,
    required: true,
  },
  address: {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zip: { type: String, default: null },
    country: { type: String, default: null },
  },
  role: {
    type: String,
    required: true,
    enum: {
      values: ["admin", "manager", "artisan", "customer"],
      message: "{VALUE} is not a valid role",
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  tokenExpiresAt: {
    type: Date,
    default: null,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiresAt: {
    type: Date,
    default: null,
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

(userSchema as any).pre(
  "save",
  async function (this: any, next: (err?: any) => void) {
    if (this.isValid === false && this.isModified("isValid")) {
      try {
        await Promise.all([
          Product.deleteMany({ userId: this._id }),
          Cart.deleteMany({ userId: this._id }),
          Ticket.deleteMany({ userId: this._id }),
          Workshop.deleteMany({ userId: this._id, status: 0 }),
          Workshop.updateMany({ artisanId: this._id }, { $set: { status: 0 } }),
          Request.deleteMany({ userId: this._id }),
          Request.updateMany(
            { artisanId: this._id },
            { $set: { isAccepted: false } }
          ),
        ]);
      } catch (error) {
        return next(error as any);
      }
    }
    next();
  }
);

export default mongoose.model("User", userSchema);
