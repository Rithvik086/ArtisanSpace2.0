// --- FULLY FIXED CART PAGE (copy/paste entire file) ---

import React, { useCallback, useEffect, useState } from "react";
import CustomerHeader from "./CustomerHeader";
import CustomerFooter from "./CustomerFooter";
import CartItem from "./CartItem";

type Product = {
    _id: string;
    name: string;
    image?: string;
    category?: string;
    material?: string;
    newPrice?: number;
};

type CartEntry = {
    productId: Product;
    quantity: number;
};

const dummyCart: CartEntry[] = [
    {
        productId: {
            _id: "dummy1",
            name: "Handmade Vase",
            image: "/images/dummy/vase.jpg",
            newPrice: 599,
        },
        quantity: 1,
    },
    {
        productId: {
            _id: "dummy2",
            name: "Wooden Toy Car",
            image: "/images/dummy/toy.jpg",
            newPrice: 299,
        },
        quantity: 2,
    },
];

const Cart: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<CartEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [notifications, setNotifications] = useState<
        { id: string; message: string; type: "success" | "error" }[]
    >([]);

    const notify = (msg: string, type: "success" | "error") => {
        const id = String(Date.now());
        setNotifications((n) => [...n, { id, message: msg, type }]);
        setTimeout(() => {
            setNotifications((n) => n.filter((x) => x.id !== id));
        }, 2500);
    };

    useEffect(() => {
        (async () => {
            try {
                const userRes = await fetch("/customer/api/user");
                if (userRes.ok) {
                    const user = await userRes.json();
                    setUserId(user.id || null);
                }
            } catch {}

            await refreshCart();
        })();
    }, []);

    const refreshCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/customer/api/cart");
            if (!res.ok) throw new Error("Failed");

            const data = await res.json();
            setCartItems(data.cart || dummyCart);
        } catch {
            setError("Unable to load cart. Using offline data.");
            setCartItems(dummyCart);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCartApi = async (pid: string, action: string, amount = 0) => {
        try {
            const res = await fetch(
                `/customer/cart?userId=${userId || ""}&productId=${pid}&action=${action}&amount=${amount}`,
                { method: "POST" }
            );
            const data = await res.json();

            notify(data.message || "Updated", data.success ? "success" : "error");
            await refreshCart();
        } catch {
            notify("Error updating cart", "error");
        }
    };

    const handleRemove = (pid: string) => updateCartApi(pid, "rem");
    const handleQuantityChange = (pid: string, qty: number) =>
        updateCartApi(pid, "none", qty);
    const handleIncrement = (pid: string) => updateCartApi(pid, "add");
    const handleDecrement = (pid: string) => updateCartApi(pid, "del");

    if (loading) {
        return (
            <>
                <CustomerHeader />
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="text-center text-amber-800">
                        <div className="animate-spin h-10 w-10 rounded-full border-4 border-amber-900 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-lg font-semibold">Loading cart...</p>
                    </div>
                </div>
                <CustomerFooter />
            </>
        );
    }

    return (
        <>
            <CustomerHeader />

            <main className="min-h-screen bg-[#f8f5f2] py-12 px-4">
                <div className="max-w-3xl mx-auto">

                    {error && (
                        <div className="bg-yellow-200 text-yellow-900 p-4 rounded-md mb-6 font-semibold text-center">
                            {error}
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-amber-900 mb-8">
                        Your Cart
                    </h1>

                    {cartItems.length === 0 ? (
                        <div className="text-center bg-white p-10 rounded-lg shadow">
                            <h2 className="text-xl font-semibold">Your cart is empty</h2>
                            <a
                                href="/customer/store"
                                className="inline-block mt-5 px-6 py-3 bg-amber-900 text-white rounded-md shadow hover:bg-amber-800"
                            >
                                Shop Now
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* FIXED: Each item now in its own card */}
                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.productId._id}
                                        className="bg-white p-5 rounded-xl shadow border"
                                    >
                                        <CartItem
                                            item={item}
                                            onIncrement={handleIncrement}
                                            onDecrement={handleDecrement}
                                            onQuantityChange={handleQuantityChange}
                                            onRemove={handleRemove}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-10">
                                <button
                                    className="bg-amber-900 text-white px-8 py-3 rounded-lg shadow hover:bg-amber-800"
                                    onClick={() =>
                                        (window.location.href = "/customer/checkout")
                                    }
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <div className="fixed bottom-6 right-6 space-y-2 z-50">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`px-4 py-2 rounded shadow text-white ${
                            n.type === "success" ? "bg-green-600" : "bg-red-600"
                        }`}
                    >
                        {n.message}
                    </div>
                ))}
            </div>

            <CustomerFooter />
        </>
    );
};

export default Cart;
