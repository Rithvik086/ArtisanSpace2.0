import mongoose from "mongoose";
import Order from "../models/ordersModel.js";
import Product from "../models/productModel.js";

export type B2BOrderStatus = "pending" | "shipped" | "delivered" | "cancelled";
export type B2BPaymentStatus = "unpaid" | "paid" | "failed";

interface GetProductsParams {
  artisanId: string;
  category: string[] | null;
  material: string[] | null;
  search: string | null;
  page: number;
  limit: number;
  status?: "approved" | "pending" | "disapproved";
}

interface GetOrdersParams {
  artisanId: string;
  page: number;
  limit: number;
  status?: B2BOrderStatus;
  paymentStatus?: B2BPaymentStatus;
  from?: string;
  to?: string;
}

const toObjectId = (id: string, fieldName: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return new mongoose.Types.ObjectId(id);
};

const normalizeMultiFilter = (values: string[] | null) =>
  values
    ?.map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`^${escaped.replace(/_/g, "[ _]")}$`, "i");
    }) || [];

export async function getB2BProducts(params: GetProductsParams) {
  const artisanObjectId = toObjectId(params.artisanId, "artisan ID");
  const queryFilter: Record<string, unknown> = {
    userId: artisanObjectId,
    isValid: true,
  };

  if (params.status) {
    queryFilter.status = params.status;
  }

  const categoryRegexes = normalizeMultiFilter(params.category);
  if (categoryRegexes.length > 0) {
    queryFilter.category = { $in: categoryRegexes };
  }

  const materialRegexes = normalizeMultiFilter(params.material);
  if (materialRegexes.length > 0) {
    queryFilter.material = { $in: materialRegexes };
  }

  if (params.search?.trim()) {
    const escapedSearch = params.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedSearch, "i");
    queryFilter.$or = [
      { name: searchRegex },
      { category: searchRegex },
      { material: searchRegex },
      { description: searchRegex },
    ];
  }

  const skip = (params.page - 1) * params.limit;

  const [totalProducts, products] = await Promise.all([
    Product.countDocuments(queryFilter),
    Product.find(queryFilter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean(),
  ]);

  return {
    products,
    pagination: {
      currentPage: params.page,
      totalPages: Math.ceil(totalProducts / params.limit),
      totalProducts,
      hasNextPage: params.page * params.limit < totalProducts,
      hasPrevPage: params.page > 1,
    },
  };
}

export async function getB2BProductById(artisanId: string, productId: string) {
  const artisanObjectId = toObjectId(artisanId, "artisan ID");
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    userId: artisanObjectId,
    isValid: true,
  }).lean();

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function getB2BOrders(params: GetOrdersParams) {
  const artisanObjectId = toObjectId(params.artisanId, "artisan ID");
  const query: Record<string, unknown> = {
    isValid: true,
    "products.productId.artisanId": artisanObjectId,
  };

  if (params.status) {
    query.status = params.status;
  }
  if (params.paymentStatus) {
    query.paymentStatus = params.paymentStatus;
  }

  if (params.from || params.to) {
    const purchasedAt: Record<string, Date> = {};
    if (params.from) {
      purchasedAt.$gte = new Date(params.from);
    }
    if (params.to) {
      purchasedAt.$lte = new Date(params.to);
    }
    query.purchasedAt = purchasedAt;
  }

  const skip = (params.page - 1) * params.limit;

  const [totalOrders, orders] = await Promise.all([
    Order.countDocuments(query),
    Order.find(query)
      .populate("userId", "name email mobile_no")
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean(),
  ]);

  const mappedOrders = (orders || []).map((order: any) => {
    const artisanItems = Array.isArray(order.products)
      ? order.products.filter(
          (item: any) =>
            String(item?.productId?.artisanId || "") === params.artisanId,
        )
      : [];

    const itemCount = artisanItems.reduce(
      (sum: number, item: any) => sum + (Number(item?.quantity) || 0),
      0,
    );
    const artisanRevenue = artisanItems.reduce(
      (sum: number, item: any) =>
        sum +
        (Number(item?.productId?.newPrice) || 0) * (Number(item?.quantity) || 0),
      0,
    );

    return {
      ...order,
      products: artisanItems,
      itemCount,
      artisanRevenue,
    };
  });

  return {
    orders: mappedOrders,
    pagination: {
      currentPage: params.page,
      totalPages: Math.ceil(totalOrders / params.limit),
      totalOrders,
      hasNextPage: params.page * params.limit < totalOrders,
      hasPrevPage: params.page > 1,
    },
  };
}

export async function getB2BOrderById(artisanId: string, orderId: string) {
  const artisanObjectId = toObjectId(artisanId, "artisan ID");
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    isValid: true,
    "products.productId.artisanId": artisanObjectId,
  })
    .populate("userId", "name email mobile_no address")
    .lean();

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}

export async function updateB2BOrderStatus(
  artisanId: string,
  orderId: string,
  status: B2BOrderStatus,
) {
  const artisanObjectId = toObjectId(artisanId, "artisan ID");
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID");
  }

  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      isValid: true,
      "products.productId.artisanId": artisanObjectId,
    },
    { status },
    { new: true, runValidators: true },
  );

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  return updatedOrder;
}

export async function getB2BSalesAnalytics(artisanId: string) {
  const artisanObjectId = toObjectId(artisanId, "artisan ID");

  const [totalsRows, statusRows, monthlyRows] = await Promise.all([
    Order.aggregate([
      { $match: { isValid: true } },
      { $unwind: "$products" },
      { $match: { "products.productId.artisanId": artisanObjectId } },
      {
        $addFields: {
          lineRevenue: {
            $multiply: [
              { $ifNull: ["$products.productId.newPrice", 0] },
              { $ifNull: ["$products.quantity", 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$lineRevenue" },
          totalItemsSold: { $sum: { $ifNull: ["$products.quantity", 0] } },
          paidLineItems: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0],
            },
          },
          orderIds: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalItemsSold: 1,
          paidLineItems: 1,
          totalOrders: { $size: "$orderIds" },
        },
      },
    ]),
    Order.aggregate([
      { $match: { isValid: true } },
      { $unwind: "$products" },
      { $match: { "products.productId.artisanId": artisanObjectId } },
      { $group: { _id: { orderId: "$_id", status: "$status" } } },
      { $group: { _id: "$_id.status", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isValid: true } },
      { $unwind: "$products" },
      { $match: { "products.productId.artisanId": artisanObjectId } },
      {
        $addFields: {
          _date: {
            $cond: [
              { $ifNull: ["$purchasedAt", false] },
              "$purchasedAt",
              { $toDate: "$createdAt" },
            ],
          },
          lineRevenue: {
            $multiply: [
              { $ifNull: ["$products.productId.newPrice", 0] },
              { $ifNull: ["$products.quantity", 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $month: "$_date" },
          total: { $sum: "$lineRevenue" },
        },
      },
    ]),
  ]);

  const totals = totalsRows?.[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalItemsSold: 0,
    paidLineItems: 0,
  };

  const ordersByStatus = (statusRows || []).reduce(
    (acc: Record<string, number>, row: any) => {
      const key = String(row?._id || "unknown");
      acc[key] = Number(row?.count || 0);
      return acc;
    },
    {},
  );

  const averageOrderValue =
    totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0;

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyTotals = new Array(12).fill(0);
  (monthlyRows || []).forEach((row: any) => {
    const month = Number(row?._id);
    if (!Number.isNaN(month) && month >= 1 && month <= 12) {
      monthlyTotals[month - 1] = Number(row?.total || 0);
    }
  });
  const monthlySales = MONTHS.map((month, index) => ({
    month,
    sales: monthlyTotals[index],
  }));

  return {
    summary: {
      totalRevenue: totals.totalRevenue,
      totalOrders: totals.totalOrders,
      totalItemsSold: totals.totalItemsSold,
      paidLineItems: totals.paidLineItems,
      averageOrderValue,
    },
    ordersByStatus,
    monthlySales,
  };
}
