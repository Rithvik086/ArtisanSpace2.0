import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, CreditCard, ShoppingBag, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Order {
  _id: string;
  products: {
    productId: {
      name: string;
      category: string;
      image: string;
      newPrice: number;
    };
    quantity: number;
  }[];
  money: number;
  purchasedAt: string;
  status: string;
}

const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const calculateSubtotal = (order: Order) => {
    return order.products.reduce(
      (total, item) => total + item.productId.newPrice * item.quantity,
      0,
    );
  };

  const calculateTax = (subtotal: number) => {
    return Math.round(subtotal * 0.18 * 100) / 100; // 18% tax
  };

  const calculateShipping = (subtotal: number) => {
    return Math.round(subtotal * 0.05 * 100) / 100; // 5% shipping
  };

  const calculateTotal = (order: Order) => {
    const subtotal = calculateSubtotal(order);
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + tax + shipping;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/user");
        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/customer/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-900 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <ShoppingBag className="mx-auto h-16 w-16 text-amber-400 mb-4" />
          <h2 className="text-3xl font-bold text-amber-900 mb-4">
            No Orders Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start exploring our artisan
            marketplace!
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2 flex items-center gap-3">
            <Package className="h-8 w-8" />
            Your Orders
          </h1>
          <p className="text-gray-600">Track and manage all your purchases</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order._id}
              className="hover:shadow-lg transition-shadow duration-200 border-amber-200 bg-white/80 backdrop-blur-sm cursor-pointer"
              onClick={() => handleOrderClick(order._id)}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-amber-900 mb-2 flex items-center gap-2">
                      Order #{order._id.slice(-8)}
                      <Eye className="h-4 w-4 text-amber-600" />
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.purchasedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-600" />
                      <span className="text-2xl font-bold text-amber-900">
                        ₹{calculateTotal(order).toLocaleString()}
                      </span>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(order.status)}
                      className="border-0 font-medium"
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-amber-900 mb-3">
                    Items Ordered ({order.products.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.products.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg"
                      >
                        <img
                          src={item.productId.image}
                          alt={item.productId.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-amber-900 text-sm truncate">
                            {item.productId.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.products.length > 3 && (
                      <div className="flex items-center justify-center p-3 bg-amber-50/50 rounded-lg">
                        <span className="text-sm text-amber-700 font-medium">
                          +{order.products.length - 3} more items
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center pt-2">
                    <span className="text-sm text-amber-600 font-medium hover:text-amber-700">
                      Click to view full details →
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
