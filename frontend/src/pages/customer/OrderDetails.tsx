import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  ArrowLeft,
  Printer,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
} from "lucide-react";

interface Order {
  _id: string;
  userId: {
    name: string;
    email: string;
    mobile_no: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  deliveryPersonId?: {
    name: string;
    mobile_no: string;
  };
  products: {
    productId: {
      name: string;
      category: string;
      material: string;
      image: string;
      oldPrice: number;
      newPrice: number;
      quantity: number;
      description: string;
    };
    quantity: number;
  }[];
  money: number;
  purchasedAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        const response = await api.get(`/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "shipped":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.products.reduce(
      (total, item) => total + item.productId.newPrice * item.quantity,
      0,
    );
  };

  const calculateTax = (subtotal: number) => {
    return Math.round(subtotal * 0.18 * 100) / 100; // 18% tax
  };

  const calculateShipping = () => {
    return Math.round(calculateSubtotal() * 0.05 * 100) / 100; // 5% shipping
  };

  const handlePrint = () => {
    // Add print-specific styles
    const printStyles = `
      @media print {
        body { font-size: 12px; }
        .no-print { display: none !important; }
        .page-break { page-break-before: always; }
        @page { margin: 1cm; }
      }
    `;

    const style = document.createElement("style");
    style.textContent = printStyles;
    document.head.appendChild(style);

    window.print();

    // Clean up
    document.head.removeChild(style);
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would generate and download a PDF
    alert("Invoice download feature coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-900 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Package className="mx-auto h-16 w-16 text-amber-400 mb-4" />
          <h2 className="text-3xl font-bold text-amber-900 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => navigate("/customer?tab=orders")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping();
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate("/customer?tab=orders")}
            className="mb-4 flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2 flex items-center gap-3">
                <Package className="h-8 w-8" />
                Order Details
              </h1>
              <p className="text-gray-600">Order #{order._id.slice(-8)}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors print:hidden"
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors print:hidden"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <div className="text-center border-b-2 border-amber-600 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              ArtisanSpace
            </h1>
            <p className="text-gray-600">Invoice #{order._id.slice(-8)}</p>
            <p className="text-sm text-gray-500">
              Generated on{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Order Status */}
        <Card className="mb-6 border-amber-200 bg-white/80 backdrop-blur-sm print:shadow-none print:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge
                className={`${getStatusColor(
                  order.status,
                )} border font-medium px-4 py-2`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <div className="text-sm text-gray-600">
                <p>
                  Ordered on:{" "}
                  {new Date(order.purchasedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  Last updated:{" "}
                  {new Date(order.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-amber-900">
                  {order.userId.name}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {order.userId.email}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {order.userId.mobile_no}
                </p>
              </div>

              <div>
                <p className="font-medium text-amber-900 mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  {order.userId.address?.street && (
                    <p>{order.userId.address.street}</p>
                  )}
                  {order.userId.address?.city && (
                    <p>{order.userId.address.city}</p>
                  )}
                  {order.userId.address?.state && order.userId.address?.zip && (
                    <p>
                      {order.userId.address.state}, {order.userId.address.zip}
                    </p>
                  )}
                  {order.userId.address?.country && (
                    <p>{order.userId.address.country}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.deliveryPersonId ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-amber-900">
                      {order.deliveryPersonId.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {order.deliveryPersonId.mobile_no}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Delivery Partner Assigned</p>
                    <p>Estimated delivery: 3-5 business days</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Delivery partner will be assigned soon
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%):</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span>₹{shipping.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg text-amber-900">
                  <span>Total:</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card className="mt-6 border-amber-200 bg-white/80 backdrop-blur-sm print:shadow-none print:border">
          <CardHeader>
            <CardTitle>Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {order.products.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-amber-50/50 rounded-lg print:bg-gray-50"
                >
                  <div className="relative">
                    <img
                      src={item.productId.image}
                      alt={item.productId.name}
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 text-lg mb-2">
                      {item.productId.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <p>
                        <span className="font-medium">Category:</span>{" "}
                        {item.productId.category}
                      </p>
                      <p>
                        <span className="font-medium">Material:</span>{" "}
                        {item.productId.material}
                      </p>
                      <p>
                        <span className="font-medium">Price per unit:</span> ₹
                        {item.productId.newPrice.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Quantity:</span>{" "}
                        {item.quantity}
                      </p>
                    </div>
                    {item.productId.description && (
                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Description:</span>{" "}
                        {item.productId.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Subtotal: ₹
                        {(
                          item.productId.newPrice * item.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card className="mt-6 border-amber-200 bg-white/80 backdrop-blur-sm print:shadow-none print:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-8 bg-green-500"></div>
                </div>
                <div>
                  <p className="font-medium text-amber-900">Order Placed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {order.status !== "pending" && (
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        ["shipped", "delivered"].includes(order.status)
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    {order.status === "delivered" && (
                      <div className="w-0.5 h-8 bg-blue-500"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Order Shipped</p>
                    <p className="text-sm text-gray-600">
                      {order.status === "pending" ? "Pending" : "In transit"}
                    </p>
                  </div>
                </div>
              )}

              {order.status === "delivered" && (
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">
                      Order Delivered
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support & Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Have questions about your order? Our support team is here to
                  help.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    support@artisanspace.com
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> +91 98765 43210
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Hours:</span> Mon-Fri 9AM-6PM
                    IST
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/customer/store")}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would add items back to cart
                    alert("Reorder functionality coming soon!");
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Reorder Items
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
