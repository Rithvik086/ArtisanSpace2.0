import type { Request, Response } from "express";
import { getOrders } from "../services/orderServices.js";
import { getProducts } from "../services/productServices.js";
import { getUsers } from "../services/userServices.js";

export const getOrdersChart = async (req: Request, res: Response) => {
  try {
    const orders = await getOrders();

    const formatted = orders.map((order) => ({
      purchasedAt: order.purchasedAt,
      amount: order.money,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching orders chart data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders chart data. Please try again later.",
    });
  }
};

export const getProductsChart = async (req: Request, res: Response) => {
  try {
    const products = await getProducts();

    const formatted = products.map((product) => ({
      createdAt: product._id.getTimestamp(),
      name: product.name,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching products chart data:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve products chart data. Please try again later.",
    });
  }
};

export const getCustomerChart = async (req: Request, res: Response) => {
  try {
    const customers = await getUsers();
    const formatted = customers.map((c) => ({
      registeredAt: c._id.getTimestamp(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching customer chart data:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve customer chart data. Please try again later.",
    });
  }
};
