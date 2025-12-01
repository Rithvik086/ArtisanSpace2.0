import { useEffect, useState } from "react";
import api from "../lib/axios";
import {
  Package,
  CheckCircle,
  Truck,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react";

interface Order {
  _id: string;
  userId?: {
    name?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    mobile_no?: string;
  };
  products: Array<{
    productId?: {
      name?: string;
      image?: string;
    };
    quantity: number;
  }>;
  money: number;
  status: string;
  purchasedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  orders?: T[];
  message?: string;
}

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [availableRes, myRes] = await Promise.all([
        api.get<ApiResponse<Order>>("/delivery/available"),
        api.get<ApiResponse<Order>>("/delivery/my-orders"),
      ]);

      if (availableRes.data.success && availableRes.data.orders) {
        setAvailableOrders(availableRes.data.orders);
      }
      if (myRes.data.success && myRes.data.orders) {
        setMyOrders(myRes.data.orders);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await api.post<{ success: boolean; message?: string }>(
        "/delivery/accept",
        { orderId }
      );
      if (res.data.success) {
        fetchOrders(); // Refresh lists
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as any).response?.data?.message || "Failed to accept order"
          : "Failed to accept order";
      alert(errorMessage);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await api.post<{ success: boolean; message?: string }>(
        "/delivery/complete",
        { orderId }
      );
      if (res.data.success) {
        fetchOrders(); // Refresh lists
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as any).response?.data?.message || "Failed to complete order"
          : "Failed to complete order";
      alert(errorMessage);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-amber-950 flex items-center gap-2">
          <Truck className="w-8 h-8" />
          Delivery Dashboard
        </h1>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700">
                Available Orders
              </p>
              <p className="text-2xl font-bold text-amber-950">
                {availableOrders.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700">
                Active Deliveries
              </p>
              <p className="text-2xl font-bold text-amber-950">
                {myOrders.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700">
                Completed Today
              </p>
              <p className="text-2xl font-bold text-amber-950">
                {
                  myOrders.filter((order) => order.status === "delivered")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-amber-950">
                ₹{myOrders.reduce((sum, order) => sum + order.money, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Orders Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-amber-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Available for Pickup
          </h2>
          <div className="space-y-4">
            {availableOrders.length === 0 ? (
              <p className="text-amber-700">No orders available for pickup.</p>
            ) : (
              availableOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="grow">
                      <h4 className="text-md font-semibold text-amber-950">
                        Order #{order._id.slice(-6)}
                      </h4>
                      <p className="text-sm text-amber-700">
                        {new Date(order.purchasedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-amber-700">
                        Customer: {order.userId?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-amber-700">
                        {order.userId?.address?.street || "No street"},{" "}
                        {order.userId?.address?.city || "No city"}
                      </p>
                      <p className="text-sm text-amber-700 font-semibold">
                        Order Value: ₹{order.money}
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-50 px-4 py-3 flex justify-end">
                    <button
                      onClick={() => handleAcceptOrder(order._id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* My Orders Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-amber-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            My Active Deliveries
          </h2>
          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <p className="text-amber-700">You have no active deliveries.</p>
            ) : (
              myOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="grow">
                      <h4 className="text-md font-semibold text-amber-950">
                        Order #{order._id.slice(-6)}
                      </h4>
                      <p className="text-sm text-amber-700">
                        {new Date(order.purchasedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-amber-700">
                        Delivery Address: {order.userId?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-amber-700">
                        {order.userId?.address?.street || "No street"},{" "}
                        {order.userId?.address?.city || "No city"}
                      </p>
                      <p className="text-sm text-amber-700">
                        Phone: {order.userId?.mobile_no || "No phone"}
                      </p>
                      <p className="text-sm text-amber-700 font-semibold">
                        Order Value: ₹{order.money}
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-50 px-4 py-3 flex justify-between items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.status !== "delivered" && (
                      <button
                        onClick={() => handleCompleteOrder(order._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
