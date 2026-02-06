import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import { useLoading } from "@/components/ui/LoadingProvider";
import {
  ShoppingBag,
  MapPin,
  Edit3,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Package,
  Truck,
  Calculator,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  productId: {
    _id: string;
    name: string;
    newPrice: number;
    quantity: number;
    image: string;
  };
  quantity: number;
}

interface UserAddress {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

const Checkout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0); // 5% of subtotal
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [modalMessage, setModalMessage] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  // Function to check if address is complete
  const isAddressComplete = (address: UserAddress | null) => {
    return (
      address && address.street && address.city && address.state && address.zip
    );
  };

  // Fallback hardcoded address for users without address - REMOVED
  // const fallbackAddress = {
  //   street: "BHI Hostel IIIT Sricity",
  //   city: "Daman, Sricity",
  //   state: "Andhra Pradesh",
  //   zip: "517646",
  //   country: "India",
  // };

  useEffect(() => {
    if (user) {
      fetchCart();
      // Safely set user address
      setUserAddress(user.address || null);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      showLoading();
      const response = await axios.get("/cart");
      if (response.data.cart.length === 0) {
        navigate("/customer/cart");
        return;
      }
      setCart(response.data.cart);
      setSubtotal(response.data.amount);
      setTotal(response.data.totalamount);
      setShipping(response.data.amount * (5 / 100));
      setTax(response.data.amount * (18 / 100));
    } catch (error) {
      console.error("Error fetching cart:", error);
      showToast("Error loading cart data", "error");
      navigate("/customer/cart");
    } finally {
      hideLoading();
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAddressComplete(userAddress)) {
      showToast(
        "Please update your shipping address in settings before placing an order.",
        "error",
      );
      return;
    }

    // For COD, show confirmation modal
    if (selectedPayment === "cod") {
      setModalMessage(
        `Are you sure you want to place this order for ₹${total.toFixed(
          2,
        )}?\n\nPayment Method: Cash on Delivery`,
      );
      setModalAction(() => handleCODOrder);
      setShowModal(true);
    } else {
      // For pay now, show confirmation modal
      setModalMessage(
        `Are you sure you want to proceed with payment for ₹${total.toFixed(
          2,
        )}?\n\nPayment Method: Online Payment (Card/UPI)`,
      );
      setModalAction(() => handleOnlinePayment);
      setShowModal(true);
    }
  };

  const handleCODOrder = async () => {
    try {
      showLoading();
      const response = await axios.post("/orders", {});
      if (response.data.success) {
        showToast(
          `Order placed successfully! 🎉 Order Total: ₹${response.data.orderTotal}`,
          "success",
        );
        setTimeout(() => {
          navigate("/customer");
        }, 2000);
      } else {
        showToast(response.data.message || "Failed to place order", "error");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to place order";
      showToast(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  const handleOnlinePayment = async () => {
    try {
      showLoading();

      // Create order
      const orderResponse = await axios.post("/payments/create-order");
      const order = orderResponse.data;
      if (!order.orderId) throw new Error("Order creation failed");

      // Load Razorpay if not loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        document.body.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      // Razorpay options
      const options = {
        key: "rzp_test_S4taigLOZNozsn",
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Artisan Space",
        description: "Payment for your order",
        handler: (_response: any) => {
          // Payment submitted - webhook will verify and update DB automatically
          showToast(
            "Payment submitted. Your order will be confirmed shortly.",
            "success",
          );
          setTimeout(() => {
            navigate("/customer");
          }, 2000);
          hideLoading();
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Payment failed";
      showToast(errorMessage, "error");
      hideLoading();
    }
  };

  const displayAddress = userAddress;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-amber-50">
        <main className="grow flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <Package className="w-16 h-16 text-amber-800 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-950 mb-2">
              Your cart is empty
            </h2>
            <p className="text-amber-700/80 mb-6">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Link
              to="/customer/store"
              className="inline-flex items-center gap-2 bg-amber-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <main className="grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/customer/cart"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-4 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-amber-950 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-amber-800" />
              Checkout
            </h1>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column - Order Summary */}
            <section className="lg:col-span-7 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
                <h2 className="text-xl font-bold text-amber-950 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-800" />
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.productId._id}
                      className="flex gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-amber-100 shrink-0">
                        <img
                          src={item.productId.image}
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-950 mb-1">
                          {item.productId.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-amber-700 font-medium">
                            ₹{item.productId.newPrice.toFixed(2)}
                          </span>
                          <div className="text-sm text-amber-600">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right mt-2">
                          <span className="font-bold text-amber-900">
                            Item Total: ₹
                            {(item.productId.newPrice * item.quantity).toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-amber-200 mt-6 pt-6 space-y-3">
                  <div className="flex items-center justify-between text-amber-800/70">
                    <span className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Subtotal
                    </span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-800/70">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Shipping (5%)
                    </span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-800/70">
                    <span>Tax (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-amber-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-amber-950">
                        Total Amount
                      </span>
                      <span className="text-2xl font-extrabold text-amber-900">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Column - Shipping & Payment */}
            <section className="lg:col-span-5 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                <h2 className="text-xl font-bold text-amber-950 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-800" />
                  Shipping Information
                </h2>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  {isAddressComplete(userAddress) ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-amber-950">
                            {user?.name || "Delivery Address"}
                          </h3>
                          {displayAddress?.street && (
                            <p className="text-amber-700 mt-1">
                              {displayAddress.street}
                            </p>
                          )}
                          {displayAddress?.city && (
                            <p className="text-amber-700">
                              {displayAddress.city}
                            </p>
                          )}
                          {displayAddress?.state && (
                            <p className="text-amber-700">
                              State: {displayAddress.state}
                            </p>
                          )}
                          {displayAddress?.zip && (
                            <p className="text-amber-700">
                              Pincode: {displayAddress.zip}
                            </p>
                          )}
                          {displayAddress?.country && (
                            <p className="text-amber-700">
                              {displayAddress.country}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate("/settings")}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Change Address
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-amber-700 mb-4">
                        No shipping address found. Please update your address in
                        settings to place an order.
                      </p>
                      <button
                        onClick={() => navigate("/settings")}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Update Address
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                <h2 className="text-xl font-bold text-amber-950 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-800" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className="flex items-center p-4 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === "cod"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-amber-950">
                        Cash on Delivery
                      </span>
                    </div>
                  </label>

                  {/* Pay Now - Online Payment */}
                  <label className="flex items-center p-4 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={selectedPayment === "online"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-amber-950">
                        Pay Now (Card/UPI)
                      </span>
                    </div>
                  </label>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    cart.length === 0 || !isAddressComplete(userAddress)
                  }
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold mt-6 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Place Order - ₹{total.toFixed(2)}
                </button>

                {!isAddressComplete(userAddress) && (
                  <p className="mt-4 text-center text-sm text-red-600">
                    Please update your shipping address in settings to place an
                    order.
                  </p>
                )}

                <div className="mt-4 text-center">
                  <p className="text-xs text-amber-600">
                    By placing your order, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="underline hover:text-amber-800"
                    >
                      Terms & Conditions
                    </Link>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in">
              <h2 className="text-xl font-bold text-amber-950 mb-4">
                Confirm Order
              </h2>
              <p className="text-amber-700 mb-6 whitespace-pre-line">
                {modalMessage}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-amber-300 text-amber-800 rounded-xl font-semibold hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowModal(false);
                    if (modalAction) {
                      await modalAction();
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
