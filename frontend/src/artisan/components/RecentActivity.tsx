import { ShoppingCart, TrendingUp } from "lucide-react";
import { craftStyles, cn } from "../../styles/theme";

interface RecentOrder {
  _id: string;
  money: number;
  purchasedAt: string;
  status: string;
  paymentStatus: string;
  productCount: number;
}

interface RecentOrdersProps {
  orders: RecentOrder[];
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentColor: Record<string, string> = {
  paid: "text-green-700 font-semibold",
  unpaid: "text-red-700 font-semibold",
  failed: "text-red-900 font-semibold",
};

const asNumber = (value: unknown, fallback = 0) => {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-4 font-baloo flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" />
        Recent Orders (Last 10)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-200">
              <th className="text-left py-2 px-2 text-amber-800 font-semibold">
                Order ID
              </th>
              <th className="text-left py-2 px-2 text-amber-800 font-semibold">
                Date
              </th>
              <th className="text-right py-2 px-2 text-amber-800 font-semibold">
                Amount
              </th>
              <th className="text-center py-2 px-2 text-amber-800 font-semibold">
                Items
              </th>
              <th className="text-center py-2 px-2 text-amber-800 font-semibold">
                Status
              </th>
              <th className="text-center py-2 px-2 text-amber-800 font-semibold">
                Payment
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-amber-600">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-amber-100 hover:bg-amber-50"
                >
                  <td className="py-3 px-2 text-amber-900 font-mono text-xs">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-2 text-amber-900">
                    {new Date(order.purchasedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-amber-900">
                    ₹{asNumber(order.money).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center text-amber-900">
                    {order.productCount}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        statusColor[order.status] ||
                          "bg-gray-100 text-gray-800",
                      )}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "py-3 px-2 text-center",
                      paymentColor[order.paymentStatus] || "text-gray-700",
                    )}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TopProduct {
  _id: string;
  name: string;
  quantity: number;
  newPrice: number;
  category: string;
}

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-4 font-baloo flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Top Selling Products
      </h3>
      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-center py-8 text-amber-600">No sales yet</p>
        ) : (
          products.map((product, idx) => (
            <div
              key={product._id}
              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-amber-900">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-amber-900">{product.name}</p>
                    <p className="text-xs text-amber-600 capitalize">
                      {product.category}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-amber-900">
                  {product.quantity} sold
                </p>
                <p className="text-xs text-amber-600">₹{product.newPrice}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
