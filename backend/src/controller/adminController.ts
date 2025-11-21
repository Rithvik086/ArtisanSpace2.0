import type { Request, Response } from "express";
// User lookup moved to user service (see services/userServices.ts)
import { getAllProductsForAdmin } from "../services/productServices.js";
import { getAllOrdersForAdmin, getSalesData as getSalesDataService } from "../services/orderServices.js";
import { getAllTicketsForAdmin } from "../services/ticketServices.js";

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

export default {
  getProductsList,
  getOrdersList,
  getSalesData,
};
