import type { Request, Response } from "express";
// User lookup moved to user service (see services/userServices.ts)
import { getAllProductsForAdmin } from "../services/productServices.js";
import { getAllOrdersForAdmin, getSalesData as getSalesDataService } from "../services/orderServices.js";
import { getAllTicketsForAdmin } from "../services/ticketServices.js";
import Order from "../models/ordersModel.js";
import Product from "../models/productModel.js";

export const getProductsList = async (_req: Request, res: Response) => {
  try {
    // Fetch products from database and map to frontend-friendly shape
    const products = await getAllProductsForAdmin();
    const mapped = (Array.isArray(products) ? products : []).map((p: any) => ({
      id: String(p._id),
      image: p.image,
      name: p.name,
      uploadedBy: p.uploadedBy,
      quantity: p.quantity ?? p.number ?? 0,
      oldPrice: p.oldPrice ?? p.price ?? 0,
      newPrice: p.newPrice ?? p.price ?? 0,
      category: p.category,
      status: p.status,
      description: p.description,
      createdAt: p.createdAt,
      isValid: p.isValid,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getOrdersList = async (_req: Request, res: Response) => {
  try {
    // Fetch orders, populate user info, and map to frontend shape
    const orders = await getAllOrdersForAdmin();
    const mapped = (Array.isArray(orders) ? orders : []).map((o: any) => {
      const items = Array.isArray(o.products) ? o.products.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) : 0;
      return {
        id: String(o._id),
        customer: o.userId ? (o.userId.name || o.userId.email) : undefined,
        date: o.purchasedAt ? new Date(o.purchasedAt).toISOString() : (o.createdAt || new Date().toISOString()),
        items,
        total: o.money ?? 0,
        status: o.status,
        raw: o,
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const getSalesData = async (_req: Request, res: Response) => {
  try {
    const salesData = await getSalesDataService();
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Revenue Analytics Functions
export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let matchCondition: any = { isValid: true };

    if (startDate && endDate) {
      matchCondition.purchasedAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    let groupBy: any;
    let dateFormat: string;

    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: "$_date" },
          month: { $month: "$_date" },
          day: { $dayOfMonth: "$_date" }
        };
        dateFormat = "%Y-%m-%d";
        break;
      case 'weekly':
        groupBy = {
          year: { $year: "$_date" },
          week: { $week: "$_date" }
        };
        dateFormat = "%Y-W%U";
        break;
      default: // monthly
        groupBy = { month: { $month: "$_date" } };
        dateFormat = "%m";
    }

    const revenueData = await Order.aggregate([
      {
        $match: matchCondition
      },
      {
        $addFields: {
          _date: {
            $cond: [
              { $ifNull: ["$purchasedAt", false] },
              "$purchasedAt",
              { $toDate: "$createdAt" }
            ]
          }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: { $ifNull: ["$money", 0] } },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: { $ifNull: ["$money", 0] } }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Calculate overall metrics
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      period,
      data: revenueData,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getRevenueByCategory = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let matchCondition: any = { isValid: true };

    if (startDate && endDate) {
      matchCondition.purchasedAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const categoryRevenue = await Order.aggregate([
      {
        $match: matchCondition
      },
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      },
      {
        $group: {
          _id: "$productInfo.category",
          revenue: {
            $sum: {
              $multiply: ["$products.quantity", "$productInfo.newPrice"]
            }
          },
          units: { $sum: "$products.quantity" },
          orders: { $addToSet: "$_id" }
        }
      },
      {
        $project: {
          category: "$_id",
          revenue: 1,
          units: 1,
          orderCount: { $size: "$orders" }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    res.json(categoryRevenue);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getGeographicRevenue = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let matchCondition: any = { isValid: true };

    if (startDate && endDate) {
      matchCondition.purchasedAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const geoRevenue = await Order.aggregate([
      {
        $match: matchCondition
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $group: {
          _id: {
            state: "$userInfo.address.state",
            city: "$userInfo.address.city"
          },
          revenue: { $sum: { $ifNull: ["$money", 0] } },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          location: {
            $concat: ["$_id.city", ", ", "$_id.state"]
          },
          state: "$_id.state",
          city: "$_id.city",
          revenue: 1,
          orders: 1
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 20
      }
    ]);

    res.json(geoRevenue);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Product Performance Functions
export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10, sortBy = 'revenue', startDate, endDate } = req.query;

    let matchCondition: any = { isValid: true };

    if (startDate && endDate) {
      matchCondition.purchasedAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const sortField = sortBy === 'units' ? 'totalUnits' : 'totalRevenue';

    const topProducts = await Order.aggregate([
      {
        $match: matchCondition
      },
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      },
      {
        $group: {
          _id: "$products.productId",
          productName: { $first: "$productInfo.name" },
          category: { $first: "$productInfo.category" },
          image: { $first: "$productInfo.image" },
          totalUnits: { $sum: "$products.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$products.quantity", "$productInfo.newPrice"]
            }
          },
          orderCount: { $addToSet: "$_id" }
        }
      },
      {
        $project: {
          productId: "$_id",
          productName: 1,
          category: 1,
          image: 1,
          totalUnits: 1,
          totalRevenue: 1,
          orderCount: { $size: "$orderCount" },
          avgOrderValue: {
            $divide: ["$totalRevenue", "$orderCount"]
          }
        }
      },
      {
        $sort: { [sortField]: -1 }
      },
      {
        $limit: parseInt(limit as string)
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getInventoryAnalytics = async (req: Request, res: Response) => {
  try {
    const { threshold = 10 } = req.query;

    // Get all products with inventory info
    const products = await Product.find({ isValid: true })
      .select('name category quantity newPrice createdAt')
      .lean();

    // Calculate inventory metrics
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => (p.quantity || 0) > 0).length;
    const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0).length;
    const lowStockProducts = products.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= parseInt(threshold as string)).length;

    // Calculate inventory value
    const totalInventoryValue = products.reduce((sum, p) => {
      return sum + ((p.quantity || 0) * (p.newPrice || 0));
    }, 0);

    // Get low stock alerts (including out of stock)
    const lowStockAlerts = products
      .filter(p => (p.quantity || 0) <= parseInt(threshold as string))
      .map(p => ({
        productId: p._id,
        name: p.name,
        category: p.category,
        currentStock: p.quantity || 0,
        threshold: parseInt(threshold as string)
      }))
      .sort((a, b) => a.currentStock - b.currentStock);

    // Group inventory by category
    const categoryInventory = products.reduce((acc: any, p) => {
      const category = p.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          category,
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalUnits: 0,
          inventoryValue: 0
        };
      }
      acc[category].totalProducts += 1;
      acc[category].totalUnits += p.quantity || 0;
      acc[category].inventoryValue += (p.quantity || 0) * (p.newPrice || 0);

      if ((p.quantity || 0) === 0) {
        acc[category].outOfStock += 1;
      } else if ((p.quantity || 0) <= parseInt(threshold as string)) {
        acc[category].lowStock += 1;
      } else {
        acc[category].inStock += 1;
      }

      return acc;
    }, {});

    const inventoryByCategory = Object.values(categoryInventory);

    // Get all products with status, sorted alphabetically
    const allProducts = products
      .map(p => ({
        productId: p._id,
        name: p.name,
        category: p.category,
        stock: p.quantity || 0,
        status: (p.quantity || 0) === 0 ? 'out' : (p.quantity || 0) <= parseInt(threshold as string) ? 'low' : 'healthy',
        inventoryValue: (p.quantity || 0) * (p.newPrice || 0)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      summary: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        totalInventoryValue
      },
      lowStockAlerts,
      stockLevels: {
        healthy: inStockProducts - lowStockProducts,
        low: lowStockProducts,
        out: outOfStockProducts
      },
      inventoryByCategory,
      allProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    // Get today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's revenue
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          isValid: true,
          purchasedAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $ifNull: ["$money", 0] } },
          orders: { $sum: 1 }
        }
      }
    ]);

    // This month's revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = await Order.aggregate([
      {
        $match: {
          isValid: true,
          purchasedAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $ifNull: ["$money", 0] } },
          orders: { $sum: 1 }
        }
      }
    ]);

    // Total products and active products
    const productStats = await Product.aggregate([
      {
        $match: { isValid: true }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      }
    ]);

    // Recent orders (last 5)
    const recentOrders = await Order.find({ isValid: true })
      .populate('userId', 'name email')
      .sort({ purchasedAt: -1 })
      .limit(5)
      .select('userId purchasedAt money status')
      .lean();

    res.json({
      today: {
        revenue: todayRevenue[0]?.revenue || 0,
        orders: todayRevenue[0]?.orders || 0
      },
      month: {
        revenue: monthRevenue[0]?.revenue || 0,
        orders: monthRevenue[0]?.orders || 0
      },
      products: {
        total: productStats[0]?.total || 0,
        approved: productStats[0]?.approved || 0,
        pending: productStats[0]?.pending || 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customer: (order.userId as any)?.name || (order.userId as any)?.email || 'Unknown',
        date: order.purchasedAt,
        amount: order.money,
        status: order.status
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export default {
  getProductsList,
  getOrdersList,
  getSalesData,
  getRevenueAnalytics,
  getRevenueByCategory,
  getGeographicRevenue,
  getTopSellingProducts,
  getInventoryAnalytics,
  getDashboardOverview,
};
