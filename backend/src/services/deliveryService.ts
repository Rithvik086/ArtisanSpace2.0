import Order from "../models/ordersModel.js";

export const getAvailableOrdersService = async () => {
  try {
    // Find orders that are 'pending' or 'shipped' and have no delivery person assigned
    const orders = await Order.find({
      status: { $in: ["pending", "shipped"] },
      deliveryPersonId: null,
      isValid: true,
    }).populate("userId", "name address mobile_no");
    return { success: true, orders };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};

export const acceptOrderService = async (
  orderId: string,
  deliveryPersonId: string
) => {
  try {
    const order = await Order.findOne({ _id: orderId, isValid: true });
    if (!order) {
      return { success: false, message: "Order not found" };
    }
    if (order.deliveryPersonId) {
      return { success: false, message: "Order already assigned" };
    }

    order.deliveryPersonId = deliveryPersonId as any;
    // Optionally update status to 'shipped' if it was 'pending'
    if (order.status === "pending") {
      order.status = "shipped";
    }
    await order.save();
    return { success: true, order };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};

export const completeOrderService = async (
  orderId: string,
  deliveryPersonId: string
) => {
  try {
    const order = await Order.findOne({ _id: orderId, isValid: true });
    if (!order) {
      return { success: false, message: "Order not found" };
    }
    if (String(order.deliveryPersonId) !== String(deliveryPersonId)) {
      return {
        success: false,
        message: "You are not assigned to this order",
      };
    }

    order.status = "delivered";
    await order.save();
    return { success: true, order };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};

export const getMyOrdersService = async (deliveryPersonId: string) => {
  try {
    const orders = await Order.find({
      deliveryPersonId: deliveryPersonId,
      isValid: true,
    }).populate("userId", "name address mobile_no");
    return { success: true, orders };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};
