import type { Request, Response } from "express";
import { z } from "zod";
import {
  getB2BOrderById,
  getB2BOrders,
  getB2BProductById,
  getB2BProducts,
  getB2BSalesAnalytics,
  updateB2BOrderStatus,
} from "../services/b2bServices.js";
import { Redis } from "../lib/redis.ts";
import logger from "../utils/logger.js";

const B2B_SALES_CACHE_TTL_SECONDS = 60;

const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["approved", "pending", "disapproved"]).optional(),
  category: z.string().optional(),
  material: z.string().optional(),
  search: z.string().optional(),
});

const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["pending", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "paid", "failed"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "shipped", "delivered", "cancelled"]),
});

const parseCsv = (value?: string): string[] | null => {
  if (!value) {
    return null;
  }
  const parts = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return parts.length > 0 ? parts : null;
};

const isValidDateString = (value?: string): boolean => {
  if (!value) {
    return true;
  }
  return !Number.isNaN(Date.parse(value));
};

export const getB2BCapabilities = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "B2B API is available",
    auth: {
      type: "JWT",
      loginRoute: "POST /api/v1/auth/login",
      header: "Authorization: Bearer <token>",
      notes:
        "Login still sets cookie token; response also returns token for custom systems.",
    },
    endpoints: [
      "GET /api/v1/b2b/products",
      "GET /api/v1/b2b/products/:id",
      "GET /api/v1/b2b/orders",
      "GET /api/v1/b2b/orders/:orderId",
      "PATCH /api/v1/b2b/orders/:orderId/status",
      "GET /api/v1/b2b/analytics/sales",
    ],
  });
};

export const listB2BProducts = async (req: Request, res: Response) => {
  const parsed = productQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues?.[0]?.message || "Invalid query parameters",
    });
  }

  try {
    const query = parsed.data;
    const category = parseCsv(query.category);
    const material = parseCsv(query.material);
    const serviceParams: {
      artisanId: string;
      category: string[] | null;
      material: string[] | null;
      search: string | null;
      page: number;
      limit: number;
      status?: "approved" | "pending" | "disapproved";
    } = {
      artisanId: req.user.id,
      category,
      material,
      search: query.search?.trim() || null,
      page: query.page || 1,
      limit: query.limit || 20,
    };
    if (query.status) serviceParams.status = query.status;

    const result = await getB2BProducts(serviceParams);

    res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      "B2B: failed to list products",
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getB2BProductDetails = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await getB2BProductById(req.user.id, productId);
    res.status(200).json({ success: true, product });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "Invalid product ID") {
      return res.status(400).json({ success: false, message });
    }
    if (message === "Product not found") {
      return res.status(404).json({ success: false, message });
    }
    logger.error(
      { error: (error as Error).message },
      "B2B: failed to fetch product details",
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const listB2BOrders = async (req: Request, res: Response) => {
  const parsed = orderQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues?.[0]?.message || "Invalid query parameters",
    });
  }

  const query = parsed.data;
  if (!isValidDateString(query.from) || !isValidDateString(query.to)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid date format in from/to" });
  }

  try {
    const serviceParams: {
      artisanId: string;
      page: number;
      limit: number;
      status?: "pending" | "shipped" | "delivered" | "cancelled";
      paymentStatus?: "unpaid" | "paid" | "failed";
      from?: string;
      to?: string;
    } = {
      page: query.page || 1,
      limit: query.limit || 20,
      artisanId: req.user.id,
    };

    if (query.status) serviceParams.status = query.status;
    if (query.paymentStatus) serviceParams.paymentStatus = query.paymentStatus;
    if (query.from) serviceParams.from = query.from;
    if (query.to) serviceParams.to = query.to;

    const result = await getB2BOrders(serviceParams);

    res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      "B2B: failed to list orders",
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getB2BOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await getB2BOrderById(req.user.id, orderId);
    res.status(200).json({ success: true, order });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "Invalid order ID") {
      return res.status(400).json({ success: false, message });
    }
    if (message === "Order not found") {
      return res.status(404).json({ success: false, message });
    }
    logger.error(
      { error: (error as Error).message },
      "B2B: failed to fetch order details",
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const patchB2BOrderStatus = async (req: Request, res: Response) => {
  const parsed = updateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues?.[0]?.message || "Invalid payload",
    });
  }

  try {
    const orderId = req.params.orderId;
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await updateB2BOrderStatus(
      req.user.id,
      orderId,
      parsed.data.status,
    );

    try {
      await Redis.del(`b2b:sales:${req.user.id}`);
    } catch {
      // Cache invalidation should not block status update responses.
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "Invalid order ID") {
      return res.status(400).json({ success: false, message });
    }
    if (message === "Order not found") {
      return res.status(404).json({ success: false, message });
    }
    logger.error(
      { error: (error as Error).message },
      "B2B: failed to update order status",
    );
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const getB2BSales = async (req: Request, res: Response) => {
  try {
    const cacheKey = `b2b:sales:${req.user.id}`;

    const analytics = await Redis.getOrSet(
      cacheKey,
      () => getB2BSalesAnalytics(req.user.id),
      B2B_SALES_CACHE_TTL_SECONDS,
    );

    res.status(200).json({
      success: true,
      ...analytics,
    });
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      "B2B: failed to fetch sales analytics",
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales analytics",
    });
  }
};
