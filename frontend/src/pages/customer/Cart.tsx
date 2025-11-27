import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Link } from "react-router-dom";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ShoppingBag,
  Minus,
  Plus,
  ArrowRight,
  CreditCard,
  PackageOpen,
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

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const [editingQuantities, setEditingQuantities] = useState<{
    [key: string]: string | undefined;
  }>({});

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get("/cart");
      setCart(response.data.cart);
      setTotal(response.data.amount);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        "/cart",
        {},
        {
          params: { productId, action: "none", amount: newQuantity },
        }
      );
      showToast("Cart updated!", "success");
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast("Failed to update cart", "error");
    }
  };

  const handleInputChange = (productId: string, value: string) => {
    setEditingQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleQuantityBlur = (productId: string, maxStock: number) => {
    const inputValue = editingQuantities[productId];
    if (!inputValue) {
      setEditingQuantities((prev) => ({ ...prev, [productId]: undefined }));
      return;
    }
    const num = parseInt(inputValue);
    if (isNaN(num) || num < 1) {
      setEditingQuantities((prev) => ({ ...prev, [productId]: undefined }));
      return;
    }
    if (num > maxStock) {
      showToast(
        `Quantity exceeds available stock. Setting to maximum available: ${maxStock}`,
        "error"
      );
      updateQuantity(productId, maxStock);
    } else {
      updateQuantity(productId, num);
    }
    setEditingQuantities((prev) => ({ ...prev, [productId]: undefined }));
  };

  const incrementQuantity = (
    productId: string,
    current: number,
    maxStock: number
  ) => {
    if (current < maxStock) {
      updateQuantity(productId, current + 1);
    }
  };

  const decrementQuantity = (productId: string, current: number) => {
    if (current > 1) {
      updateQuantity(productId, current - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-800 rounded-full animate-spin"></div>
          <p className="text-amber-900 font-medium animate-pulse">
            Loading your selection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <CustomerHeader />

      <main className="grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-10 border-b border-amber-200 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-amber-950 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-amber-800" />
              Shopping Cart
              <span className="text-lg font-medium text-amber-700/60 ml-auto">
                {cart.length} {cart.length === 1 ? "Item" : "Items"}
              </span>
            </h1>
          </div>

          {cart.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-amber-100/50">
              <div className="bg-amber-100 p-6 rounded-full mb-6">
                <PackageOpen className="w-16 h-16 text-amber-800" />
              </div>
              <h2 className="text-2xl font-bold text-amber-950 mb-3">
                Your cart is currently empty
              </h2>
              <p className="text-amber-700/80 mb-8 max-w-md text-center">
                Looks like you haven't made your choice yet. Discover our
                collection and find something you love.
              </p>
              <Link
                to="/customer/store"
                className="group flex items-center gap-2 bg-amber-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-amber-800 transition-all duration-200 shadow-lg shadow-amber-900/20 hover:shadow-amber-900/30"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
              {/* Cart Items List */}
              <section className="lg:col-span-7 xl:col-span-8 space-y-6">
                {cart.map((item) => (
                  <div
                    key={item.productId._id}
                    className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-amber-100 flex flex-col sm:flex-row gap-6"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden rounded-xl bg-amber-100 shrink-0 sm:w-40 sm:h-40 w-full h-48">
                      <img
                        src={item.productId.image}
                        alt={item.productId.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-amber-950 mb-1">
                            {item.productId.name}
                          </h3>
                          <p className="text-sm font-medium text-amber-600/80 bg-amber-50 inline-block px-2 py-1 rounded-md">
                            {item.productId.quantity > 0
                              ? "In Stock"
                              : "Out of Stock"}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-amber-900">
                          ${item.productId.newPrice.toFixed(2)}
                        </p>
                      </div>

                      {/* Controls Section */}
                      <div className="mt-auto pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <label className="text-xs font-bold text-amber-900/50 uppercase tracking-wider">
                            Quantity
                          </label>
                          <div className="flex items-center bg-amber-50 rounded-lg border border-amber-200 p-1 w-fit">
                            <button
                              onClick={() =>
                                decrementQuantity(
                                  item.productId._id,
                                  item.quantity
                                )
                              }
                              className="p-2 rounded-md hover:bg-white hover:shadow-sm text-amber-800 transition-all disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={
                                editingQuantities[item.productId._id] ??
                                item.quantity
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  item.productId._id,
                                  e.target.value
                                )
                              }
                              onBlur={() =>
                                handleQuantityBlur(
                                  item.productId._id,
                                  item.productId.quantity
                                )
                              }
                              className="w-12 text-center bg-transparent border-none focus:ring-0 text-amber-900 font-semibold text-lg p-0 mx-1 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              style={{
                                WebkitAppearance: "none",
                                MozAppearance: "textfield",
                              }}
                              min="1"
                            />
                            <button
                              onClick={() =>
                                incrementQuantity(
                                  item.productId._id,
                                  item.quantity,
                                  item.productId.quantity
                                )
                              }
                              className="p-2 rounded-md hover:bg-white hover:shadow-sm text-amber-800 transition-all disabled:opacity-50"
                              disabled={
                                item.quantity >= item.productId.quantity
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 sm:pl-6 w-full">
                          <label className="text-xs font-bold text-amber-900/50 uppercase tracking-wider mb-2 block">
                            Special Instructions
                          </label>
                          <textarea
                            placeholder="Add notes..."
                            className="w-full text-sm bg-white border border-amber-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none placeholder:text-amber-300 text-amber-900"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Order Summary */}
              <section className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
                <div className="bg-white rounded-2xl shadow-lg shadow-amber-900/5 border border-amber-100 p-6 lg:sticky lg:top-8">
                  <h2 className="text-xl font-bold text-amber-950 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-amber-800/70">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-800/70">
                      <span>Shipping Estimate</span>
                      <span className="text-amber-600 text-sm">
                        Calculated at checkout
                      </span>
                    </div>

                    <div className="border-t border-amber-100 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-lg font-bold text-amber-950">
                          Order Total
                        </span>
                        <span className="text-2xl font-extrabold text-amber-900">
                          ${total.toFixed(2)}
                        </span>
                      </div>

                      <button className="w-full bg-amber-900 text-white py-4 px-6 rounded-xl font-bold hover:bg-amber-800 transition-all duration-200 shadow-lg shadow-amber-900/20 hover:shadow-amber-900/30 flex items-center justify-center gap-2 group">
                        <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Proceed to Checkout
                      </button>

                      <div className="mt-6 text-center">
                        <Link
                          to="/customer/store"
                          className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline transition-colors"
                        >
                          Or continue shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default Cart;
