import mongoose from "mongoose";
import Order from "../models/ordersModel.js";
import { getUserCart } from "./cartServices.js";
import { decreaseProductQuantity, productCount } from "./productServices.js";
import Cart from "../models/cartModel.js";
// import { getCart, removeCart } from "./cartServices.js";
// import { decreaseProductQuantity, productCount } from "./productServices.js";

export async function placeUserOrder(userId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Get cart with populated product and user data
    let cart = await Cart.findOne({ userId })
      .populate("products.productId")
      .populate("userId")
      .session(session);

    if (!cart || cart.products.length === 0) {
      throw new Error("Cart is empty!");
    }

    let subtotal = 0;

    // Validate stock and calculate subtotal
    for (const item of cart.products) {
      const product = item.productId as any;
      const availableStock = await productCount(product._id, session);

      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      subtotal += product.newPrice * item.quantity;
    }

    // Calculate final amount with tax and shipping
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
    const shipping = 50; // Fixed shipping fee
    const totalAmount = parseFloat((subtotal + tax + shipping).toFixed(2));

    // Reduce inventory for each product
    for (const item of cart.products) {
      const product = item.productId as any;
      const newStock = await productCount(product._id, session) - item.quantity;

      const response = await decreaseProductQuantity(
        product._id,
        newStock,
        session
      );

      if (!response.success) {
        throw new Error(`Failed to update inventory for product: ${product.name}`);
      }
    }

    // Create order object with embedded product data
    const orderProducts = cart.products.map(item => {
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
      userId: cart.userId,
      products: orderProducts,
      money: totalAmount,
      purchasedAt: new Date(),
      status: "pending",
    };

    // Insert order into database
    await Order.create([orderData], { session });

    // Remove cart after successful order placement
    const cartRemovalResponse = await Cart.findOneAndDelete({ userId }, { session });
    if (!cartRemovalResponse) {
      throw new Error("Failed to remove cart after order placement");
    }

    await session.commitTransaction();
    return {
      success: true,
      message: "Order placed successfully!",
      orderTotal: totalAmount,
      itemCount: cart.products.length
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
    const orders = await Order.find().populate("userId");
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
    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      throw new Error("Order not found!");
    }
    return order;
  } catch (err) {
    throw new Error("Error in getting order by ID: " + (err as Error).message);
  }
}

// export async function changeOrderStatus(orderId, status) {
//   try {
//     const order = await Order.findById(orderId);
//     if (!order) {
//       throw new Error("Order not found!");
//     }
//     order.status = status;
//     await order.save();
//     return { success: true, message: "Order status updated successfully!" };
//   } catch (err) {
//     throw new Error("Error in changing order status: " + err.message);
//   }
// }

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

// export async function deleteOrderById(orderId) {
//   try {
//     const order = await Order.findById(orderId);
//     if (!order) {
//       throw new Error("Order not found!");
//     }
//     await Order.deleteOne({ _id: orderId });
//     return { success: true, message: "Order deleted successfully!" };
//   } catch (err) {
//     throw new Error("Error in deleting order: " + err.message);
//   }
// }
