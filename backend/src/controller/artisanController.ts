import type { Request, Response } from "express";
import Order from "../models/ordersModel.js";
import Product from "../models/productModel.js";
import CustomRequest from "../models/customRequestModel.js";
import Workshop from "../models/workshopModel.js";
import { Redis } from "../lib/redis.ts";

const ANALYTICS_CACHE_TTL = 300; // 5 minutes

type AnalyticsPeriodKey = "7d" | "30d" | "90d" | "6m" | "1y";

const ANALYTICS_PERIODS: Record<
  AnalyticsPeriodKey,
  { days: number; label: string }
> = {
  "7d": { days: 7, label: "Last 7 days" },
  "30d": { days: 30, label: "Last 30 days" },
  "90d": { days: 90, label: "Last 90 days" },
  "6m": { days: 180, label: "Last 6 months" },
  "1y": { days: 365, label: "Last 12 months" },
};

const resolvePeriod = (rawPeriod?: string) => {
  const period = (rawPeriod as AnalyticsPeriodKey) || "30d";
  return ANALYTICS_PERIODS[period] ? period : ("30d" as AnalyticsPeriodKey);
};

const getPeriodBounds = (period: AnalyticsPeriodKey) => {
  const days = ANALYTICS_PERIODS[period].days;
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate, label: ANALYTICS_PERIODS[period].label };
};

interface ArtisanAnalytics {
  totalRevenue: number;
  totalOrders: number;
  thisMonthRevenue: number;
  thisMonthOrders: number;
  productStats: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
  };
  orderBreakdown: {
    pending: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  customRequests: {
    total: number;
    accepted: number;
    pending: number;
  };
  workshops: {
    total: number;
    accepted: number;
    pending: number;
  };
  recentOrders: Array<{
    _id: string;
    money: number;
    purchasedAt: string;
    status: string;
    paymentStatus: string;
    productCount: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    quantity: number;
    newPrice: number;
    category: string;
  }>;
}

interface ArtisanAnalyticsResponse extends ArtisanAnalytics {
  period: AnalyticsPeriodKey;
  periodLabel: string;
  periodRevenue: number;
  periodOrders: number;
  timeRange: {
    startDate: string;
    endDate: string;
  };
}

interface ArtisanOrderTrendResponse {
  period: AnalyticsPeriodKey;
  periodLabel: string;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  trend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export const getArtisanAnalytics = async (req: Request, res: Response) => {
  try {
    const artisanId = req.user?.id;
    if (!artisanId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const period = resolvePeriod(req.query.period as string | undefined);
    const { startDate, endDate, label } = getPeriodBounds(period);

    const cacheKey = `artisan:analytics:${artisanId}:${period}`;

    const cached = await Redis.get<ArtisanAnalyticsResponse>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Fetch all required data in parallel
    const [allOrders, products, customRequests, workshops] = await Promise.all([
      Order.find({
        "products.productId.artisanId": artisanId,
        isValid: true,
      }).lean(),
      Product.find({ userId: artisanId, isValid: true }).lean(),
      CustomRequest.find({
        artisanId,
        isValid: true,
      }).lean(),
      Workshop.find({ artisanId, isValid: true }).lean(),
    ]);

    // Calculate analytics
    let totalRevenue = 0;
    let periodRevenue = 0;
    let periodOrders = 0;
    const orderBreakdown = {
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    allOrders.forEach((order) => {
      totalRevenue += order.money;

      const purchaseDate = new Date(order.purchasedAt);
      if (purchaseDate >= startDate && purchaseDate <= endDate) {
        periodRevenue += order.money;
        periodOrders += 1;
      }

      if (
        orderBreakdown[order.status as keyof typeof orderBreakdown] !==
        undefined
      ) {
        orderBreakdown[order.status as keyof typeof orderBreakdown]++;
      }
    });

    // Product stats
    const productStats = {
      total: products.length,
      active: products.filter((p: any) => p.status === "approved").length,
      pending: products.filter((p: any) => p.status === "pending").length,
      rejected: products.filter((p: any) => p.status === "disapproved").length,
    };

    // Custom requests stats
    const customRequestStats = {
      total: customRequests.length,
      accepted: customRequests.filter((cr: any) => cr.isAccepted).length,
      pending: customRequests.filter((cr: any) => !cr.isAccepted).length,
    };

    // Workshops stats
    const workshopStats = {
      total: workshops.length,
      accepted: workshops.filter((w: any) => w.status === 1).length,
      pending: workshops.filter((w: any) => w.status === 0).length,
    };

    // Recent orders (last 10)
    const recentOrders = allOrders
      .sort(
        (a, b) =>
          new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
      )
      .slice(0, 10)
      .map((order) => ({
        _id: order._id.toString(),
        money: order.money,
        purchasedAt: new Date(order.purchasedAt).toISOString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        productCount: order.products.length,
      }));

    // Top products (by quantity in orders)
    const productSalesMap = new Map<string, { count: number; product: any }>();
    allOrders.forEach((order) => {
      order.products.forEach((item) => {
        if (!item.productId?.sourceProductId) return;
        const prodId = item.productId.sourceProductId.toString();
        const existing = productSalesMap.get(prodId) || {
          count: 0,
          product: item.productId,
        };
        existing.count += item.quantity;
        productSalesMap.set(prodId, existing);
      });
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        _id: item.product.sourceProductId.toString(),
        name: item.product.name,
        quantity: item.count,
        newPrice: item.product.newPrice,
        category: item.product.category,
      }));

    const analytics: ArtisanAnalytics = {
      totalRevenue,
      totalOrders: allOrders.length,
      thisMonthRevenue: periodRevenue,
      thisMonthOrders: periodOrders,
      productStats,
      orderBreakdown,
      customRequests: customRequestStats,
      workshops: workshopStats,
      recentOrders,
      topProducts,
    };

    const response: ArtisanAnalyticsResponse = {
      ...analytics,
      period,
      periodLabel: label,
      periodRevenue,
      periodOrders,
      timeRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    // Cache the result
    await Redis.set(cacheKey, response, ANALYTICS_CACHE_TTL);

    res.json(response);
  } catch (error) {
    console.error("Error fetching artisan analytics:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      message: (error as Error).message,
    });
  }
};

export const getArtisanOrderTrend = async (req: Request, res: Response) => {
  try {
    const artisanId = req.user?.id;
    if (!artisanId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const period = resolvePeriod(req.query.period as string | undefined);
    const { startDate, endDate, label } = getPeriodBounds(period);

    const cacheKey = `artisan:trend:${artisanId}:${period}`;
    const cached = await Redis.get<ArtisanOrderTrendResponse>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const orders = await Order.find({
      "products.productId.artisanId": artisanId,
      isValid: true,
    })
      .select("purchasedAt money")
      .lean();

    // Group by date (last 30 days)
    const trendMap = new Map<string, { revenue: number; count: number }>();
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    orders.forEach((order) => {
      const date = new Date(order.purchasedAt);
      if (date >= startDate && date <= endDate) {
        const dateStr = date.toISOString().split("T")[0]!;
        const existing = trendMap.get(dateStr) || { revenue: 0, count: 0 };
        existing.revenue += order.money;
        existing.count += 1;
        trendMap.set(dateStr, existing);
      }
    });

    // Fill missing dates with 0
    const trend = [];
    const totalDays = ANALYTICS_PERIODS[period].days;
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0]!;
      const data = trendMap.get(dateStr);
      trend.push({
        date: dateStr,
        revenue: data?.revenue || 0,
        orders: data?.count || 0,
      });
    }

    const response: ArtisanOrderTrendResponse = {
      period,
      periodLabel: label,
      timeRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      trend,
    };

    await Redis.set(cacheKey, response, ANALYTICS_CACHE_TTL);
    res.json(response);
  } catch (error) {
    console.error("Error fetching order trend:", error);
    res.status(500).json({
      error: "Failed to fetch order trend",
      message: (error as Error).message,
    });
  }
};
