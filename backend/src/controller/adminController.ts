import type { Request, Response } from "express";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/ordersModel.js";
import Ticket from "../models/supportTicketModel.js";

function monthName(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

export const getUsersList = async (_req: Request, res: Response) => {
  try {
    // Fetch users from database and exclude sensitive fields
    const users = await User.find({}).select('-password -verificationToken -resetToken -tokenExpiresAt -resetTokenExpiresAt').lean();
    const mapped = (Array.isArray(users) ? users : []).map((u: any) => ({
      id: String(u._id),
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      mobile_no: u.mobile_no,
      createdAt: u.createdAt,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// Removed legacy hardcoded demo arrays so endpoints always return DB data.

export const getProductsList = async (_req: Request, res: Response) => {
  try {
    // Fetch products from database and map to frontend-friendly shape
    const products = await Product.find({}).lean();
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
    const orders = await Order.find({}).populate('userId', 'name email').lean();
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

export const getFeedbackList = async (_req: Request, res: Response) => {
  try {
    // Fetch tickets and populate user name, map to simple feedback objects
    const tickets = await Ticket.find({}).populate('userId', 'name').lean();
    const mapped = (Array.isArray(tickets) ? tickets : []).map((t: any) => ({
      id: String(t._id),
      fullName: t.userId ? (t.userId.name || '') : 'Anonymous',
      message: t.description || t.subject || '',
      createdAt: t.createdAt,
    }));
    // Return tickets from DB (may be empty array if none)
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getSalesData = async (_req: Request, res: Response) => {
  try {
    // Aggregate sales (sum of `money`) by month from orders collection
    const agg = await Order.aggregate([
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
          _id: { $month: "$_date" },
          total: { $sum: { $ifNull: ["$money", 0] } }
        }
      }
    ]).exec();

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const totals = new Array(12).fill(0);
    (agg || []).forEach((row: any) => {
      const m = Number(row._id);
      if (!Number.isNaN(m) && m >= 1 && m <= 12) totals[m - 1] = Number(row.total || 0);
    });
    const salesData = MONTHS.map((month, idx) => ({ month, sales: totals[idx] }));
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export default {
  getUsersList,
  getProductsList,
  getOrdersList,
  getFeedbackList,
  getSalesData,
};
