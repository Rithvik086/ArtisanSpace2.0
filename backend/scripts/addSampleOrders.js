import mongoose from "mongoose";
import Order from "../models/ordersModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

const addSampleData = async () => {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/artisan-space",
    );

    // Get some existing products and users
    const products = await Product.find({ isValid: true }).limit(5);
    const users = await User.find({}).limit(3);

    if (products.length === 0 || users.length === 0) {
      console.log("No products or users found. Please add some data first.");
      return;
    }

    // Create sample orders
    const sampleOrders = [
      {
        userId: users[0]._id,
        products: [
          { productId: products[0]._id, quantity: 2 },
          { productId: products[1]._id, quantity: 1 },
        ],
        money: products[0].newPrice * 2 + products[1].newPrice * 1,
        status: "completed",
        purchasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isValid: true,
      },
      {
        userId: users[1]._id,
        products: [
          { productId: products[2]._id, quantity: 3 },
          { productId: products[3]._id, quantity: 1 },
        ],
        money: products[2].newPrice * 3 + products[3].newPrice * 1,
        status: "completed",
        purchasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isValid: true,
      },
      {
        userId: users[0]._id,
        products: [{ productId: products[4]._id, quantity: 1 }],
        money: products[4].newPrice * 1,
        status: "completed",
        purchasedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isValid: true,
      },
    ];

    await Order.insertMany(sampleOrders);
    console.log("Sample orders added successfully!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error adding sample data:", error);
  }
};

addSampleData();
