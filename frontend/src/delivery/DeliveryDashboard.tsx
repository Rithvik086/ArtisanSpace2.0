import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../lib/axios";
import {
  Package,
  CheckCircle,
  Truck,
  TrendingUp,
  Clock,
  MapPin,
  Calendar,
  Phone,
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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 w-12 h-12 border-4 border-amber-300 border-t-amber-900 rounded-full"
          />
          <p className="text-amber-900 font-baloo text-lg">
            Loading your dashboard...
          </p>
        </motion.div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="text-red-500 mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-stone-100 font-baloo">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 flex items-center justify-center gap-3 mb-4">
              <Truck className="w-10 h-10" />
              Delivery Dashboard
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light">
              Manage your deliveries and track your earnings
            </p>
          </motion.header>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-amber-500 rounded-xl shadow-md">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-stone-600 uppercase tracking-wider">
                    Available Orders
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    {availableOrders.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-amber-900 rounded-xl shadow-md">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-stone-600 uppercase tracking-wider">
                    Active Deliveries
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    {
                      myOrders.filter((order) => order.status !== "delivered")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-xl shadow-md">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-stone-600 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    {
                      myOrders.filter((order) => order.status === "delivered")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-amber-900 rounded-xl shadow-md">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-stone-600 uppercase tracking-wider">
                    Total Earnings
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    ₹
                    {myOrders
                      .filter((order) => order.status === "delivered")
                      .reduce(
                        (sum, order) => sum + Math.round(order.money * 0.1),
                        0
                      )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        {/* Available Orders Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-amber-800 p-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Clock className="w-8 h-8" />
                Available for Pickup
                <span className="ml-auto bg-white/20 text-white px-3 py-1 rounded-full text-base font-medium">
                  {availableOrders.length} orders
                </span>
              </h2>
              <p className="text-amber-100 mt-2 text-lg">
                New orders ready for delivery
              </p>
            </div>

            <div className="p-6">
              {availableOrders.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-24 h-24 text-amber-300 mx-auto mb-6" />
                  <p className="text-stone-600 text-xl font-medium mb-2">
                    No orders available for pickup
                  </p>
                  <p className="text-stone-600 text-lg">
                    Check back later for new orders
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {availableOrders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-amber-900 mb-1">
                              Order #{order._id.slice(-6)}
                            </h4>
                            <div className="flex items-center text-sm text-amber-950">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(order.purchasedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">
                              ₹{order.money}
                            </p>
                            <p className="text-sm text-amber-950 font-medium">
                              Earn: ₹{Math.round(order.money * 0.1)}
                            </p>
                          </div>
                        </div>{" "}
                        <div className="space-y-3 text-sm mb-4">
                          <div className="flex items-start text-amber-950">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">
                                {order.userId?.name || "Unknown Customer"}
                              </p>
                              <p className="text-amber-900 mt-1">
                                {order.userId?.address?.street || "No street"},{" "}
                                {order.userId?.address?.city || "No city"}
                              </p>
                            </div>
                          </div>
                          {order.userId?.mobile_no && (
                            <div className="flex items-center text-amber-950">
                              <Phone className="w-4 h-4 mr-2" />
                              <span className="font-mono">
                                {order.userId.mobile_no}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4">
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          className="w-full bg-amber-900 hover:bg-amber-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          Accept Delivery
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* My Orders Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-amber-950 p-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <MapPin className="w-8 h-8" />
                My Active Deliveries
                <span className="ml-auto bg-white/20 text-white px-3 py-1 rounded-full text-base font-medium">
                  {
                    myOrders.filter((order) => order.status !== "delivered")
                      .length
                  }{" "}
                  active
                </span>
              </h2>
              <p className="text-amber-100 mt-2 text-lg">
                Orders assigned to you for delivery
              </p>
            </div>

            <div className="p-6">
              {myOrders.filter((order) => order.status !== "delivered")
                .length === 0 ? (
                <div className="text-center py-20">
                  <Truck className="w-24 h-24 text-amber-300 mx-auto mb-6" />
                  <p className="text-amber-950 text-xl font-medium mb-2">
                    No active deliveries
                  </p>
                  <p className="text-amber-950 text-lg">
                    Accept an order to start delivering
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myOrders
                    .filter((order) => order.status !== "delivered")
                    .sort(
                      (a, b) =>
                        new Date(b.purchasedAt).getTime() -
                        new Date(a.purchasedAt).getTime()
                    )
                    .map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-amber-900 mb-1">
                                Order #{order._id.slice(-6)}
                              </h4>
                              <div className="flex items-center text-sm text-amber-950">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(
                                  order.purchasedAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">
                                ₹{order.money}
                              </p>
                              <p className="text-sm text-amber-950 font-medium">
                                Earn: ₹{Math.round(order.money * 0.1)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm mb-4">
                            <div className="flex items-start text-amber-950">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">
                                  {order.userId?.name || "Unknown Customer"}
                                </p>
                                <p className="text-amber-900 mt-1">
                                  {order.userId?.address?.street || "No street"}
                                  , {order.userId?.address?.city || "No city"}
                                </p>
                              </div>
                            </div>
                            {order.userId?.mobile_no && (
                              <div className="flex items-center text-amber-950">
                                <Phone className="w-4 h-4 mr-2" />
                                <span className="font-mono">
                                  {order.userId.mobile_no}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 flex justify-between items-center">
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status}
                          </span>
                          {order.status !== "delivered" && (
                            <button
                              onClick={() => handleCompleteOrder(order._id)}
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-sm cursor-pointer"
                            >
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Completed Deliveries Section */}
        {myOrders.filter((order) => order.status === "delivered").length >
          0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-green-600 p-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  Completed Deliveries
                  <span className="ml-auto bg-white/20 text-white px-3 py-1 rounded-full text-base font-medium">
                    {
                      myOrders.filter((order) => order.status === "delivered")
                        .length
                    }{" "}
                    completed
                  </span>
                </h2>
                <p className="text-green-100 mt-2 text-lg">
                  Successfully delivered orders
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myOrders
                    .filter((order) => order.status === "delivered")
                    .sort(
                      (a, b) =>
                        new Date(b.purchasedAt).getTime() -
                        new Date(a.purchasedAt).getTime()
                    )
                    .map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-amber-900 mb-1">
                                Order #{order._id.slice(-6)}
                              </h4>
                              <div className="flex items-center text-sm text-amber-950">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(
                                  order.purchasedAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">
                                ₹{order.money}
                              </p>
                              <p className="text-sm text-amber-950 font-medium">
                                Earn: ₹{Math.round(order.money * 0.1)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm mb-4">
                            <div className="flex items-start text-amber-950">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">
                                  {order.userId?.name || "Unknown Customer"}
                                </p>
                                <p className="text-amber-900 mt-1">
                                  {order.userId?.address?.street || "No street"}
                                  , {order.userId?.address?.city || "No city"}
                                </p>
                              </div>
                            </div>
                            {order.userId?.mobile_no && (
                              <div className="flex items-center text-amber-950">
                                <Phone className="w-4 h-4 mr-2" />
                                <span className="font-mono">
                                  {order.userId.mobile_no}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-green-50 p-4">
                          <div className="flex items-center justify-center">
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold uppercase tracking-wider">
                              Delivered ✓
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
