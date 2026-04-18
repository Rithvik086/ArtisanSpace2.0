"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { craftStyles, cn } from "../../styles/theme";
import { useToast } from "../../components/ui/ToastProvider";
import { StatsGrid } from "./KPICards";
import {
  OrderStatusBreakdown,
  ProductStats,
  RequestStats,
  WorkshopStats,
} from "./StatusBreakdown";
import { RecentOrders, TopProducts } from "./RecentActivity";
import { RevenueTrend, OrdersTrend } from "./Charts";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

interface ArtisanAnalytics {
  totalRevenue: number;
  totalOrders: number;
  periodRevenue: number;
  periodOrders: number;
  periodLabel: string;
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

interface TrendData {
  date: string;
  revenue: number;
  orders: number;
}

interface AnalyticsDashboardProps {
  analytics: ArtisanAnalytics | null;
  trendData: TrendData[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function AnalyticsDashboard({
  analytics,
  trendData,
  loading,
  refreshing,
  onRefresh,
}: AnalyticsDashboardProps) {
  const { showToast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-amber-700 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={cn(craftStyles.card.warm, "p-8 m-4")}>
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">
              Unable to Load Analytics
            </h3>
            <p className="text-amber-700 text-sm mb-4">
              We couldn't fetch your analytics data. Please try again.
            </p>
            <button
              onClick={() => {
                onRefresh();
                showToast("Retrying analytics", "success");
              }}
              className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-950 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-linear-to-b from-amber-50 to-orange-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 font-baloo">
            Business Analytics
          </h1>
          <p className="text-amber-600 mt-1">
            Track your sales and performance for {analytics.periodLabel}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={cn(
            "p-2 rounded-lg transition-all",
            refreshing
              ? "bg-amber-200 text-amber-900"
              : "bg-amber-900 text-white hover:bg-amber-950",
          )}
          title="Refresh analytics"
        >
          <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
        </button>
      </div>

      <StatsGrid
        stats={[
          {
            label: "Total Revenue",
            value: `₹${analytics.totalRevenue.toFixed(2)}`,
            icon: <DollarSign className="w-12 h-12" />,
            subtext: `${analytics.totalOrders} orders overall`,
          },
          {
            label: analytics.periodLabel,
            value: `₹${analytics.periodRevenue.toFixed(2)}`,
            icon: <TrendingUp className="w-12 h-12" />,
            subtext: `${analytics.periodOrders} orders in range`,
          },
          {
            label: "Total Orders",
            value: analytics.totalOrders,
            icon: <ShoppingCart className="w-12 h-12" />,
            subtext: `Avg order: ₹${(analytics.totalRevenue / Math.max(analytics.totalOrders, 1)).toFixed(2)}`,
          },
          {
            label: "Active Products",
            value: analytics.productStats.active,
            icon: <Package className="w-12 h-12" />,
            subtext: `${analytics.productStats.total} total`,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueTrend data={trendData} />
        </div>
        <div>
          <OrdersTrend data={trendData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrderStatusBreakdown {...analytics.orderBreakdown} />
        <ProductStats {...analytics.productStats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RequestStats {...analytics.customRequests} />
        <WorkshopStats {...analytics.workshops} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={analytics.recentOrders} />
        </div>
        <div>
          <TopProducts products={analytics.topProducts} />
        </div>
      </div>
    </div>
  );
}
