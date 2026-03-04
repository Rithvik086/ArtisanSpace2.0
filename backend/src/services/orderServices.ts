import mongoose from "mongoose";
import Order from "../models/ordersModel.js";
import { decreaseProductQuantity, productCount } from "./productServices.js";
import Cart from "../models/cartModel.js";
import logger from "../utils/logger.js";

export async function placeUserOrder(userId: string, paymentId?: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Get cart with populated product data only (userId already known)
    let cart = await Cart.findOne({ userId })
      .populate("products.productId")
      .lean()
      .session(session);

    if (!cart || cart.products.length === 0) {
      throw new Error("Cart is empty!");
    }

    let subtotal = 0;
    const stockMap = new Map<string, number>();

    // Validate stock and calculate subtotal in one pass
    for (const item of cart.products) {
      const product = item.productId as any;
      const availableStock = await productCount(product._id, session);

      // Store stock for later use to avoid re-querying
      stockMap.set(product._id.toString(), availableStock);

      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      subtotal += product.newPrice * item.quantity;
    }

    // Calculate final amount with tax and shipping
    const tax = subtotal * 0.18; // 18% tax
    const shipping = subtotal * 0.05; // 5% shipping
    const totalAmount = Math.round(subtotal + tax + shipping); // ₹ integer

    // Batch inventory updates using bulkWrite for better performance
    const bulkOps = cart.products.map((item) => {
      const product = item.productId as any;
      const currentStock = stockMap.get(product._id.toString()) || 0;
      const newStock = currentStock - item.quantity;

      return {
        updateOne: {
          filter: { _id: product._id, isValid: true },
          update: { $set: { quantity: newStock } },
        },
      };
    });

    if (bulkOps.length > 0) {
      const Product = (await import("../models/productModel.js")).default;
      await Product.bulkWrite(bulkOps, { session });
    }

    // Create order object with embedded product data
    const orderProducts = cart.products.map((item) => {
      const product = item.productId as any;
      return {
        productId: {
          name: product.name,
          category: product.category,
          material: product.material,
          image: product.image,
          oldPrice: product.oldPrice,
          newPrice: product.newPrice,
          quantity: product.quantity,
          description: product.description,
        },
        quantity: item.quantity,
      };
    });

    const orderData = {
      userId: userId,
      products: orderProducts,
      money: totalAmount,
      purchasedAt: new Date(),
      status: "pending",
      paymentId: paymentId || null,
      paymentStatus: paymentId ? "paid" : "unpaid",
    };

    // Insert order and delete cart in parallel
    const [createdOrder] = await Promise.all([
      Order.create([orderData], { session }),
      Cart.findOneAndDelete({ userId }, { session }),
    ]);

    if (!createdOrder || createdOrder.length === 0 || !createdOrder[0]) {
      throw new Error("Failed to create order");
    }

    const order = createdOrder[0];

    logger.info(
      {
        userId,
        orderId: order._id,
        amount: totalAmount,
        paymentId: paymentId || null,
        paymentStatus: paymentId ? "paid" : "unpaid",
      },
      "Order created",
    );

    await session.commitTransaction();
    return {
      success: true,
      message: "Order placed successfully!",
      orderTotal: totalAmount,
      itemCount: cart.products.length,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Error placing order: " + (error as Error).message);
  } finally {
    session.endSession();
  }
}

export async function getOrders() {
  try {
    const orders = await Order.find({ isValid: true }).populate("userId");
    if (!orders || orders.length === 0) {
      throw new Error("No orders found");
    }
    return orders;
  } catch (err) {
    throw new Error("Error in getting orders: " + (err as Error).message);
  }
}

// export async function getOrdersById(userId: string) {
//   try {
//     const orders = await Order.find({ userId });
//     if (!orders) {
//       throw new Error("Orders not found!");
//     }
//     return orders;
//   } catch (err) {
//     throw new Error("Error in getting order by ID: " + (err as Error).message);
//   }
// }

export async function getOrderByOrderId(orderId: string) {
  try {
    const order = await Order.findOne({ _id: orderId, isValid: true }).populate(
      "userId",
    );
    if (!order) {
      throw new Error("Order not found!");
    }
    return order;
  } catch (err) {
    throw new Error("Error in getting order by ID: " + (err as Error).message);
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    const orders = await Order.find({ userId, isValid: true }).sort({
      purchasedAt: -1,
    });
    return orders;
  } catch (err) {
    throw new Error(
      "Error in getting orders by user ID: " + (err as Error).message,
    );
  }
}

export async function changeOrderStatus(
  orderId: string,
  status: "pending" | "delivered" | "cancelled",
) {
  try {
    const order = await Order.findOne({ _id: orderId, isValid: true });
    if (!order) {
      throw new Error("Order not found!");
    }
    order.status = status;
    await order.save();
    return { success: true, message: "Order status updated successfully!" };
  } catch (err) {
    throw new Error(
      "Error in changing order status: " + (err as Error).message,
    );
  }
}

// export async function totalOrders() {
//   try {
//     const allOrders = await Order.find();
//     if (allOrders && allOrders.length > 0) {
//       return allOrders;
//     } else {
//       return [];
//     }
//   } catch (e) {
//     throw new Error("Error getting total orders: " + e.message);
//   }
// }

export async function deleteOrderById(orderId: string) {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, isValid: true },
      { isValid: false },
      { new: true },
    );
    if (!order) {
      throw new Error("Order not found!");
    }
    return { success: true, message: "Order deleted successfully!" };
  } catch (err) {
    throw new Error("Error in deleting order: " + (err as Error).message);
  }
}

export async function getAllOrdersForAdmin() {
  try {
    const orders = await Order.find({ isValid: true })
      .populate("userId", "name email")
      .lean();
    return orders;
  } catch (err) {
    throw new Error(
      "Error getting all orders for admin: " + (err as Error).message,
    );
  }
}

export async function getSalesData() {
  try {
    const agg = await Order.aggregate([
      {
        $match: { isValid: true },
      },
      {
        $addFields: {
          _date: {
            $cond: [
              { $ifNull: ["$purchasedAt", false] },
              "$purchasedAt",
              { $toDate: "$createdAt" },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $month: "$_date" },
          total: { $sum: { $ifNull: ["$money", 0] } },
        },
      },
    ]).exec();

    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const totals = new Array(12).fill(0);
    (agg || []).forEach((row: any) => {
      const m = Number(row._id);
      if (!Number.isNaN(m) && m >= 1 && m <= 12)
        totals[m - 1] = Number(row.total || 0);
    });
    const salesData = MONTHS.map((month, idx) => ({
      month,
      sales: totals[idx],
    }));
    return salesData;
  } catch (err) {
    throw new Error("Error getting sales data: " + (err as Error).message);
  }
}
