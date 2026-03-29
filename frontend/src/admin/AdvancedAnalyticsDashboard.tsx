import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  MapPin,
  AlertTriangle,
  BarChart3,
  Activity,
  Calendar,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

interface DashboardOverview {
  today: {
    revenue: number;
    orders: number;
  };
  month: {
    revenue: number;
    orders: number;
  };
  products: {
    total: number;
    approved: number;
    pending: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: string;
  }>;
}

interface RevenueAnalytics {
  period: string;
  data: Array<{
    _id: any;
    revenue: number;
    orders: number;
    avgOrderValue: number;
  }>;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
}

interface TopProduct {
  productId: string;
  productName: string;
  category: string;
  image: string;
  totalUnits: number;
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
}

interface InventoryAnalytics {
  summary: {
    totalProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalInventoryValue: number;
  };
  lowStockAlerts: Array<{
    productId: string;
    name: string;
    category: string;
    currentStock: number;
    threshold: number;
  }>;
  stockLevels: {
    healthy: number;
    low: number;
    out: number;
  };
  inventoryByCategory: Array<{
    category: string;
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalUnits: number;
    inventoryValue: number;
  }>;
  allProducts: Array<{
    productId: string;
    name: string;
    category: string;
    stock: number;
    status: "healthy" | "low" | "out";
    inventoryValue: number;
  }>;
}

const COLORS = ["#f59e0b", "#d97706", "#92400e", "#78350f", "#451a03"];

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Data states
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] =
    useState<RevenueAnalytics | null>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [geographicRevenue, setGeographicRevenue] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [inventoryAnalytics, setInventoryAnalytics] =
    useState<InventoryAnalytics | null>(null);
  const [inventorySortBy, setInventorySortBy] = useState<string>("name-asc");

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dateParams =
        dateRange.startDate && dateRange.endDate
          ? `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          : "";

      const [
        overviewRes,
        revenueRes,
        categoryRes,
        geoRes,
        productsRes,
        inventoryRes,
      ] = await Promise.all([
        api.get("/admin/dashboard-overview"),
        api.get(`/admin/revenue-analytics?period=monthly${dateParams}`),
        api.get(`/admin/revenue-by-category${dateParams}`),
        api.get(`/admin/geographic-revenue${dateParams}`),
        api.get(
          `/admin/top-selling-products?limit=10&sortBy=revenue${dateParams}`,
        ),
        api.get("/admin/inventory-analytics?threshold=10"),
      ]);

      setOverview(overviewRes.data);
      setRevenueAnalytics(revenueRes.data);
      setRevenueByCategory(categoryRes.data);
      setGeographicRevenue(geoRes.data);
      setTopProducts(productsRes.data);
      setInventoryAnalytics(inventoryRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSortedProducts = () => {
    if (!inventoryAnalytics?.allProducts) return [];
    
    const products = [...inventoryAnalytics.allProducts];
    
    switch (inventorySortBy) {
      case "name-asc":
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case "stock-asc":
        return products.sort((a, b) => a.stock - b.stock);
      case "stock-desc":
        return products.sort((a, b) => b.stock - a.stock);
      case "value-asc":
        return products.sort((a, b) => a.inventoryValue - b.inventoryValue);
      case "value-desc":
        return products.sort((a, b) => b.inventoryValue - a.inventoryValue);
      default:
        return products;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-amber-100">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-amber-600 mt-1">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-amber-600" />
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <span className="text-amber-600 self-center">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />{" "}
            <button
              onClick={() => setDateRange({ startDate: "", endDate: "" })}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              All Time
            </button>
            <button
              onClick={() =>
                setDateRange({
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  endDate: new Date().toISOString().split("T")[0],
                })
              }
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              Last 30 Days
            </button>{" "}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "revenue", label: "Revenue Analytics", icon: TrendingUp },
          { id: "products", label: "Product Performance", icon: Package },
          { id: "inventory", label: "Inventory", icon: BarChart3 },
          { id: "geography", label: "Geographic Insights", icon: MapPin },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-amber-600 text-white"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">
                  Today's Revenue
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(overview.today.revenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
            <div className="mt-2 text-sm text-amber-600">
              {overview.today.orders} orders
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(overview.month.revenue)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
            <div className="mt-2 text-sm text-amber-600">
              {overview.month.orders} orders
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {overview.products.total}
                </p>
              </div>
              <Package className="w-8 h-8 text-amber-600" />
            </div>
            <div className="mt-2 text-sm text-amber-600">
              {overview.products.approved} approved, {overview.products.pending}{" "}
              pending
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {revenueAnalytics
                    ? formatCurrency(revenueAnalytics.summary.avgOrderValue)
                    : "₹0"}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              Recent Orders
            </h3>
            <div className="space-y-3">
              {overview.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-amber-900">
                      {order.customer}
                    </p>
                    <p className="text-sm text-amber-600">
                      {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-900">
                      {formatCurrency(order.amount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "revenue" && revenueAnalytics && (
        <div className="space-y-6">
          {revenueAnalytics.data.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 text-center">
              <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                No Revenue Data Available
              </h3>
              <p className="text-amber-600">
                Revenue analytics will appear here once orders are placed in the
                selected date range.
              </p>
            </div>
          ) : (
            <>
              {/* Revenue Trends Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">
                  Revenue Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueAnalytics.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3e8dc" />
                      <XAxis dataKey="_id" stroke="#92400e" />
                      <YAxis
                        stroke="#92400e"
                        tickFormatter={(value) =>
                          `₹${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        labelFormatter={(label) =>
                          `${revenueAnalytics.period === "monthly" ? "Month" : "Period"}: ${label}`
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f59e0b"
                        fill="#fef3c7"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue by Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">
                    Revenue by Category
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={revenueByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) =>
                            `${category} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {revenueByCategory.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">
                    Revenue Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-amber-700">Total Revenue</span>
                      <span className="font-semibold text-amber-900">
                        {formatCurrency(revenueAnalytics.summary.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-amber-700">Total Orders</span>
                      <span className="font-semibold text-amber-900">
                        {revenueAnalytics.summary.totalOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-amber-700">
                        Average Order Value
                      </span>
                      <span className="font-semibold text-amber-900">
                        {formatCurrency(revenueAnalytics.summary.avgOrderValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              Top Selling Products
            </h3>
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">
                  No product sales data available for the selected period.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-bold">
                      {index + 1}
                    </div>
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900">
                        {product.productName}
                      </h4>
                      <p className="text-sm text-amber-600">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-amber-900">
                        {formatCurrency(product.totalRevenue)}
                      </p>
                      <p className="text-sm text-amber-600">
                        {product.totalUnits} units sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Performance Chart */}
          {topProducts.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Product Revenue vs Units
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8dc" />
                    <XAxis
                      dataKey="productName"
                      stroke="#92400e"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#92400e"
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#92400e"
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "totalRevenue" ? formatCurrency(value) : value,
                        name === "totalRevenue" ? "Revenue" : "Units",
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="totalRevenue" fill="#f59e0b" />
                    <Bar yAxisId="right" dataKey="totalUnits" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "inventory" && inventoryAnalytics && (
        <div className="space-y-6">
          {/* Inventory Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {inventoryAnalytics.summary.totalProducts}
                  </p>
                </div>
                <Package className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">
                    {inventoryAnalytics.summary.inStockProducts}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inventoryAnalytics.summary.lowStockProducts}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {inventoryAnalytics.summary.outOfStockProducts}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              Total Inventory Value
            </h3>
            <p className="text-3xl font-bold text-amber-900">
              {formatCurrency(inventoryAnalytics.summary.totalInventoryValue)}
            </p>
          </div>
{/* 
          Low Stock Alerts
          {inventoryAnalytics.lowStockAlerts.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Low Stock Alerts
              </h3>
              <div className="space-y-3">
                {inventoryAnalytics.lowStockAlerts.map((alert) => (
                  <div
                    key={alert.productId}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-amber-900">{alert.name}</p>
                      <p className="text-sm text-amber-600">{alert.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {alert.currentStock} units
                      </p>
                      <p className="text-sm text-amber-600">
                        Threshold: {alert.threshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* All Products Inventory */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-amber-900">
                All Products Inventory
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setInventorySortBy("name-asc")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    inventorySortBy === "name-asc"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  A-Z
                </button>
                <button
                  onClick={() => setInventorySortBy("name-desc")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    inventorySortBy === "name-desc"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  Z-A
                </button>
                <button
                  onClick={() => setInventorySortBy("stock-asc")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    inventorySortBy === "stock-asc"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  Stock: Low
                </button>
                <button
                  onClick={() => setInventorySortBy("stock-desc")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    inventorySortBy === "stock-desc"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  Stock: High
                </button>
                <button
                  onClick={() => setInventorySortBy("value-asc")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    inventorySortBy === "value-asc"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  Value: Low
                </button>
                <button
                  onClick={() => setInventorySortBy("value-desc")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    inventorySortBy === "value-desc"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  Value: High
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-200 bg-amber-50">
                    <th className="text-left py-3 px-4 text-amber-700 font-semibold">
                      Product Name
                    </th>
                    <th className="text-left py-3 px-4 text-amber-700 font-semibold">
                      Category
                    </th>
                    <th className="text-center py-3 px-4 text-amber-700 font-semibold">
                      Stock
                    </th>
                    <th className="text-center py-3 px-4 text-amber-700 font-semibold">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-amber-700 font-semibold">
                      Inventory Value
                    </th>
                  </tr>
                </thead>
                <tbody className="max-h-96 overflow-y-auto divide-y divide-amber-100">
                  {getSortedProducts().map((product) => (
                    <tr
                      key={product.productId}
                      className="hover:bg-amber-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-amber-900">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 text-amber-600">
                        {product.category}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-amber-900">
                        {product.stock}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === "healthy"
                              ? "bg-green-100 text-green-700"
                              : product.status === "low"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.status === "healthy"
                            ? "Healthy"
                            : product.status === "low"
                              ? "Low Stock"
                              : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-amber-900">
                        {formatCurrency(product.inventoryValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock and Out of Stock Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Products */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Low Stock Products
              </h3>
              {inventoryAnalytics.lowStockAlerts.filter(
                (alert) => alert.currentStock > 0,
              ).length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-amber-600">
                    No products are currently low on stock.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {inventoryAnalytics.lowStockAlerts
                    .filter((alert) => alert.currentStock > 0)
                    .map((alert) => (
                      <div
                        key={alert.productId}
                        className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-amber-900">
                            {alert.name}
                          </p>
                          <p className="text-sm text-amber-600">
                            {alert.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">
                            {alert.currentStock} units
                          </p>
                          <p className="text-sm text-amber-600">
                            Threshold: {alert.threshold}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Out of Stock Products */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Out of Stock Products
              </h3>
              {inventoryAnalytics.lowStockAlerts.filter(
                (alert) => alert.currentStock === 0,
              ).length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-amber-600">
                    No products are currently out of stock.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {inventoryAnalytics.lowStockAlerts
                    .filter((alert) => alert.currentStock === 0)
                    .map((alert) => (
                      <div
                        key={alert.productId}
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-amber-900">
                            {alert.name}
                          </p>
                          <p className="text-sm text-amber-600">
                            {alert.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">
                            Out of Stock
                          </p>
                          <p className="text-sm text-amber-600">
                            Threshold: {alert.threshold}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "geography" && (
        <div className="space-y-6">
          {/* Geographic Revenue Map/Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              Revenue by Location
            </h3>
            {geographicRevenue.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">
                  No geographic revenue data available for the selected period.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {geographicRevenue.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-amber-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">
                          {location.location}
                        </p>
                        <p className="text-sm text-amber-600">
                          {location.orders} orders
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-amber-900">
                      {formatCurrency(location.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Geographic Revenue Chart */}
          {geographicRevenue.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Top Locations by Revenue
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={geographicRevenue.slice(0, 10)}
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 280, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8dc" />
                    <XAxis
                      type="number"
                      stroke="#92400e"
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      dataKey="location"
                      type="category"
                      stroke="#92400e"
                      width={270}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#fffbeb",
                        border: "1px solid #f59e0b",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#f59e0b"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
