import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Link, useNavigate } from "react-router-dom";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import { useToast } from "@/components/ui/ToastProvider";
import { useLoading } from "@/components/ui/LoadingProvider";
import {
  ShoppingBag,
  MapPin,
  Edit3,
  CreditCard,
  Smartphone,
  CheckCircle,
  ArrowLeft,
  Package,
  Truck,
  Calculator,
} from "lucide-react";

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
  const [shipping] = useState(50); // Fixed shipping cost
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  // Fallback hardcoded address for users without address
  const fallbackAddress = {
    street: "BHI Hostel IIIT Sricity",
    city: "Daman, Sricity",
    state: "Andhra Pradesh",
    zip: "517646",
    country: "India",
  };

  useEffect(() => {
    if (user) {
      fetchCart();
      // Safely set user address with proper null handling
      const address = user.address
        ? {
            street: user.address.street || null,
            city: user.address.city || null,
            state: user.address.state || null,
            zip: user.address.zip || null,
            country: user.address.country || null,
          }
        : fallbackAddress;
      setUserAddress(address);
    }
  }, [user]);

  useEffect(() => {
    // Calculate tax (5% of subtotal) and total
    const calculatedTax = Math.round(subtotal * 0.05 * 100) / 100;
    setTax(calculatedTax);
    setTotal(subtotal + shipping + calculatedTax);
  }, [subtotal, shipping]);

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
    } catch (error) {
      console.error("Error fetching cart:", error);
      showToast("Error loading cart data", "error");
      navigate("/customer/cart");
    } finally {
      hideLoading();
    }
  };

  const handlePlaceOrder = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to place this order for ₹${total.toFixed(
        2
      )}?\n\nPayment Method: ${
        selectedPayment === "cod"
          ? "Cash on Delivery"
          : selectedPayment === "card"
          ? "Credit/Debit Card"
          : "UPI"
      }`
    );

    if (!confirmed) {
      return;
    }

    try {
      showLoading();
      console.log("Placing order...", {
        selectedPayment,
        total,
        cart: cart.length,
      });

      const response = await axios.post("/orders", {});
      console.log("Order response:", response.data);

      if (response.data.success) {
        showToast(
          `Order placed successfully! 🎉 Order Total: ₹${response.data.orderTotal}`,
          "success"
        );
        // Navigate to order confirmation or customer home
        setTimeout(() => {
          navigate("/customer");
        }, 2000); // Give user time to see the success message
      } else {
        showToast(response.data.message || "Failed to place order", "error");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to place order";
      showToast(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  const displayAddress = userAddress || fallbackAddress;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-amber-50">
        <CustomerHeader />
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
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <CustomerHeader />

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
                              2
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
                      Shipping
                    </span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-800/70">
                    <span>Tax</span>
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-950">
                        {user?.name || "Delivery Address"}
                      </h3>
                      {displayAddress.street && (
                        <p className="text-amber-700 mt-1">
                          {displayAddress.street}
                        </p>
                      )}
                      {displayAddress.city && (
                        <p className="text-amber-700">{displayAddress.city}</p>
                      )}
                      {displayAddress.state && (
                        <p className="text-amber-700">
                          State: {displayAddress.state}
                        </p>
                      )}
                      {displayAddress.zip && (
                        <p className="text-amber-700">
                          Pincode: {displayAddress.zip}
                        </p>
                      )}
                      {displayAddress.country && (
                        <p className="text-amber-700">
                          {displayAddress.country}
                        </p>
                      )}
                    </div>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Change Address
                    </button>
                  </div>
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

                  {/* Credit/Debit Card */}
                  <label className="flex items-center p-4 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === "card"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-amber-950">
                        Credit/Debit Card
                      </span>
                    </div>
                  </label>

                  {/* UPI */}
                  <label className="flex items-center p-4 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={selectedPayment === "upi"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="ml-3 flex-1 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-700" />
                      <span className="font-medium text-amber-950">UPI</span>
                    </div>
                  </label>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold mt-6 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Place Order - ₹{total.toFixed(2)}
                </button>

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
      </main>

      <CustomerFooter />
    </div>
  );
};

export default Checkout;
