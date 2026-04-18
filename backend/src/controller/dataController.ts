import type { Request, Response } from "express";
import { getOrders } from "../services/orderServices.js";
import { getProducts } from "../services/productServices.js";
import { getUsers } from "../services/userServices.js";
import { Redis } from "../lib/redis.ts";

const CHART_CACHE_TTL_SECONDS = 60;

export const getOrdersChart = async (req: Request, res: Response) => {
  try {
    const formatted = await Redis.getOrSet(
      "chart:orders",
      async () => {
        const orders = await getOrders();
        return orders.map((order) => ({
          purchasedAt: order.purchasedAt,
          amount: order.money,
        }));
      },
      CHART_CACHE_TTL_SECONDS,
    );

    res.json(formatted);
  } catch (error) {
    throw new Error(
      "Error fetching orders chart data: " + (error as Error).message
    );
  }
};

export const getProductsChart = async (req: Request, res: Response) => {
  try {
    const formatted = await Redis.getOrSet(
      "chart:products",
      async () => {
        const { products } = await getProducts();
        return products.map((product) => ({
          createdAt: product._id.getTimestamp(),
          name: product.name,
        }));
      },
      CHART_CACHE_TTL_SECONDS,
    );

    res.json(formatted);
  } catch (error) {
    throw new Error(
      "Error fetching products chart data: " + (error as Error).message
    );
  }
};

export const getCustomerChart = async (req: Request, res: Response) => {
  try {
    const formatted = await Redis.getOrSet(
      "chart:customers",
      async () => {
        const customers = await getUsers();
        return customers.map((c) => ({
          registeredAt: c._id.getTimestamp(),
        }));
      },
      CHART_CACHE_TTL_SECONDS,
    );

    res.json(formatted);
  } catch (error) {
    throw new Error(
      "Error fetching customer chart data: " + (error as Error).message
    );
  }
};
