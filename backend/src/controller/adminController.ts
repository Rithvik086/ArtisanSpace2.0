import type { Request, Response } from "express";
// import { getUsers } from "../services/userServices.js";
// import { getProducts as getProductsService } from "../services/productServices.js";
// import { getOrders } from "../services/orderServices.js";
// import { getTickets } from "../services/ticketServices.js";

function monthName(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

// Hardcoded data for demo purposes
const hardcodedUsers = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-123-4567",
    role: "customer",
    createdAt: "2024-01-15T08:30:00Z"
  },
  {
    _id: "2", 
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1-555-987-6543",
    role: "customer",
    createdAt: "2024-02-20T14:15:00Z"
  },
  {
    _id: "3",
    name: "Bob Wilson",
    email: "bob@example.com", 
    phone: "+1-555-456-7890",
    role: "artisan",
    createdAt: "2024-03-10T10:45:00Z"
  },
  {
    _id: "4",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-321-0987",
    role: "customer", 
    createdAt: "2024-04-05T16:20:00Z"
  }
];

export const getUsersList = async (_req: Request, res: Response) => {
  try {
    // Return hardcoded users instead of fetching from database
    res.json(hardcodedUsers);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

const hardcodedProducts = [
  {
    _id: "p1",
    name: "Handmade Ceramic Vase",
    price: 45.99,
    category: "Home Decor",
    stock: 12,
    artisan: "John Artisan",
    createdAt: "2024-01-10T09:00:00Z"
  },
  {
    _id: "p2", 
    name: "Wooden Coffee Table",
    price: 299.99,
    category: "Furniture",
    stock: 5,
    artisan: "Wood Master",
    createdAt: "2024-02-15T11:30:00Z"
  },
  {
    _id: "p3",
    name: "Hand-knitted Scarf",
    price: 29.99,
    category: "Accessories",
    stock: 25,
    artisan: "Yarn Queen",
    createdAt: "2024-03-20T14:45:00Z"
  },
  {
    _id: "p4",
    name: "Leather Wallet",
    price: 89.99,
    category: "Accessories", 
    stock: 8,
    artisan: "Leather Smith",
    createdAt: "2024-04-12T16:15:00Z"
  }
];

const hardcodedOrders = [
  {
    _id: "o1",
    userId: "1",
    productId: "p1", 
    quantity: 2,
    money: 91.98,
    status: "delivered",
    purchasedAt: "2024-01-25T10:30:00Z"
  },
  {
    _id: "o2",
    userId: "2",
    productId: "p2",
    quantity: 1, 
    money: 299.99,
    status: "shipped",
    purchasedAt: "2024-02-28T15:45:00Z"
  },
  {
    _id: "o3", 
    userId: "3",
    productId: "p3",
    quantity: 3,
    money: 89.97,
    status: "processing",
    purchasedAt: "2024-03-15T12:20:00Z"
  },
  {
    _id: "o4",
    userId: "4", 
    productId: "p4",
    quantity: 1,
    money: 89.99,
    status: "delivered",
    purchasedAt: "2024-04-20T08:15:00Z"
  }
];

const hardcodedTickets = [
  {
    _id: "t1",
    userId: "1",
    subject: "Product Quality Issue",
    message: "The ceramic vase arrived with a small crack",
    status: "open",
    priority: "medium",
    createdAt: "2024-01-30T14:20:00Z"
  },
  {
    _id: "t2",
    userId: "2", 
    subject: "Shipping Delay",
    message: "My order is taking longer than expected",
    status: "resolved",
    priority: "low",
    createdAt: "2024-03-05T09:15:00Z"
  },
  {
    _id: "t3",
    userId: "3",
    subject: "Return Request", 
    message: "Would like to return the scarf, wrong color",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-04-10T11:30:00Z"
  }
];

export const getProductsList = async (_req: Request, res: Response) => {
  try {
    // Return hardcoded products instead of fetching from database
    res.json(hardcodedProducts);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getOrdersList = async (_req: Request, res: Response) => {
  try {
    // Return hardcoded orders instead of fetching from database  
    res.json(hardcodedOrders);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getFeedbackList = async (_req: Request, res: Response) => {
  try {
    // Return hardcoded tickets instead of fetching from database
    res.json(hardcodedTickets);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getSalesData = async (_req: Request, res: Response) => {
  try {
    // Generate hardcoded sales data by month
    const salesData = [
      { month: "Jan", sales: 150.50 },
      { month: "Feb", sales: 320.75 },
      { month: "Mar", sales: 275.25 },
      { month: "Apr", sales: 410.90 },
      { month: "May", sales: 380.40 },
      { month: "Jun", sales: 520.60 },
      { month: "Jul", sales: 445.30 },
      { month: "Aug", sales: 390.80 },
      { month: "Sep", sales: 465.50 },
      { month: "Oct", sales: 510.20 },
      { month: "Nov", sales: 0 },
      { month: "Dec", sales: 0 }
    ];

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
