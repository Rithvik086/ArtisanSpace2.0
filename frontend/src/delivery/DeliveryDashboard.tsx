import { useEffect, useState } from "react";
import api from "../lib/axios";
import { Package, CheckCircle, Truck } from "lucide-react";

interface Order {
  _id: string;
  userId: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    mobile_no: string;
  };
  products: Array<{
    productId: {
      name: string;
      image: string;
    };
    quantity: number;
  }>;
  money: number;
  status: string;
  purchasedAt: string;
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
        api.get("/delivery/available"),
        api.get("/delivery/my-orders"),
      ]);

      if (availableRes.data.success) {
        setAvailableOrders(availableRes.data.orders);
      }
      if (myRes.data.success) {
        setMyOrders(myRes.data.orders);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await api.post("/delivery/accept", { orderId });
      if (res.data.success) {
        fetchOrders(); // Refresh lists
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to accept order");
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await api.post("/delivery/complete", { orderId });
      if (res.data.success) {
        fetchOrders(); // Refresh lists
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to complete order");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="w-8 h-8" />
          Delivery Dashboard
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Orders Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Available Orders
          </h2>
          <div className="space-y-4">
            {availableOrders.length === 0 ? (
              <p className="text-gray-500">No orders available for pickup.</p>
            ) : (
              availableOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.purchasedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      Customer:
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.userId?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.userId?.address?.street},{" "}
                      {order.userId?.address?.city}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(order._id)}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    Accept Order
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* My Orders Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            My Active Deliveries
          </h2>
          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <p className="text-gray-500">You have no active deliveries.</p>
            ) : (
              myOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.purchasedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      Delivery Address:
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.userId?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.userId?.address?.street},{" "}
                      {order.userId?.address?.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {order.userId?.mobile_no}
                    </p>
                  </div>

                  {order.status !== "delivered" && (
                    <button
                      onClick={() => handleCompleteOrder(order._id)}
                      className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
