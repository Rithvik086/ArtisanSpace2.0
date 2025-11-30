import React, { useEffect, useRef, useState } from "react";
import OrderCard from "./OrderCard";
import CustomerHeader from "../customer/CustomerHeader";
import CustomerFooter from "../customer/CustomerFooter";

type ProductItem = {
    productId: {
        _id?: string;
        name?: string;
        image?: string;
        newPrice?: number;
    } | null;
    quantity?: number;
};

type Order = {
    _id: string;
    products: ProductItem[];
    status: string;
    purchasedAt?: string | number;
    money?: number;
};

type Request = {
    _id?: string;
    title?: string;
    isAccepted?: boolean;
    image?: string;
    type?: string;
    description?: string;
    budget?: string | number;
    requiredBy?: string;
};

type Workshop = {
    _id?: string;
    workshopTitle?: string;
    workshopDescription?: string;
    date?: string;
    time?: string;
    status?: number;
    acceptedAt?: string;
};

type Product = {
    _id?: string;
    name?: string;
    image?: string;
};

export default function Home() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<
        "orders" | "requests" | "workshops"
    >("orders");

    const sliderRef = useRef<HTMLDivElement | null>(null);

    // Dummy Data
    const dummyOrders: Order[] = [
        {
            _id: "dummy1",
            status: "Delivered",
            money: 599,
            purchasedAt: "2025-01-01",
            products: [
                {
                    productId: {
                        _id: "p1",
                        name: "Handmade Vase",
                        image: "/images/dummy/vase.jpg",
                        newPrice: 599,
                    },
                    quantity: 1,
                },
            ],
        },
    ];

    const dummyRequests: Request[] = [
        {
            _id: "req1",
            title: "Custom Painting",
            type: "Art",
            description: "A portrait style painting",
            budget: 1000,
            requiredBy: "2025-03-12",
            isAccepted: false,
            image: "/images/dummy/painting.jpg",
        },
    ];

    const dummyWorkshops: Workshop[] = [
        {
            _id: "ws1",
            workshopTitle: "Clay Art Workshop",
            workshopDescription: "Learn shaping, carving & coloring",
            date: "2025-02-20",
            time: "3:00 PM",
            status: 1,
            acceptedAt: "2025-02-01",
        },
    ];

    const dummyProducts: Product[] = [
        { _id: "prod1", name: "Handmade Lamp", image: "/images/dummy/lamp.jpg" },
        { _id: "prod2", name: "Decor Plate", image: "/images/dummy/plate.jpg" },
    ];

    const fetchOrDummy = async <T,>(
        url: string,
        dummy: T,
        setter: (d: T) => void
    ) => {
        try {
            const res = await fetch(url);
            if (res.ok) {
                const d = await res.json();
                setter(d);
                console.log(d)
            }else {
                console.log("dummy is set")
                setter(dummy)
            }
        } catch(err) {
            console.log("dummy is set,error",err)
            setter(dummy);
        }
    };

    useEffect(() => {
        fetchOrDummy("/customer/api/orders", dummyOrders, setOrders);
        fetchOrDummy("/customer/api/requests", dummyRequests, setRequests);
        fetchOrDummy("/customer/api/workshops", dummyWorkshops, setWorkshops);
        fetchOrDummy("/api/v1/products/approved", dummyProducts, setProducts);
        console.log("effect")
    },[]);

    // Slider rotation
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        const interval = setInterval(() => {
            const first = slider.firstElementChild as HTMLElement | null;
            if (!first) return;

            const width = first.offsetWidth + 20;

            slider.style.transition = "transform .7s ease-in-out";
            slider.style.transform = `translateX(-${width}px)`;

            setTimeout(() => {
                slider.appendChild(first);
                slider.style.transition = "none";
                slider.style.transform = "translateX(0)";
            }, 700);
        }, 4000);

        return () => clearInterval(interval);
    }, [products]);

    return (
        <>
            <CustomerHeader />

            <main className="w-full m-0 bg-[#f8f5f2] pt-28 px-4 md:px-8 pb-20 text-amber-900" style={{width:'100%'}}>

                {/* WRAP EVERYTHING IN CENTERED CONTAINER */}
                <div className="max-w-5xl mx-auto flex flex-col gap-20">

                    {/* HERO */}
                    <div className="bg-white p-10 rounded-lg text-center shadow">
                        <h3 className="text-lg mb-2">We Make Things With Love</h3>
                        <h1 className="text-5xl font-bold text-amber-950">HANDMADE</h1>
                        <p className="mt-3 text-gray-700 max-w-xl mx-auto">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        </p>
                    </div>

                    {/* WELCOME ROW */}
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <img
                            src="/images/landingpage/artisan.jpg"
                            className="w-72 h-48 object-cover rounded-xl shadow"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-amber-950">
                                Welcome To ArtisanSpace
                            </h1>
                            <p className="mt-3 text-gray-700 max-w-md">
                                It is a long established fact that a reader will be distracted.
                            </p>
                        </div>
                    </div>

                    {/* SLIDER */}
                    <div className="overflow-hidden">
                        <div ref={sliderRef} className="flex gap-6 items-center">
                            {products.map((p) => (
                                <img
                                    src={p.image}
                                    key={p._id}
                                    className="w-40 h-28 object-cover rounded-lg shadow"
                                />
                            ))}
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="flex flex-col gap-10">

                        <div className="flex gap-4 border-b pb-3 justify-center">
                            {["orders", "requests", "workshops"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-5 py-2 rounded-md font-semibold ${
                                        activeTab === tab
                                            ? "bg-amber-300 text-amber-950"
                                            : "bg-white"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* CONTENT SECTION */}
                        <div className="space-y-6">
                            {/* ORDERS */}
                            {activeTab === "orders" &&
                                (orders.length > 0 ? (
                                    orders.map((order, i) => (
                                        <OrderCard key={order._id} order={order} index={i} />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-600 py-10">
                                        No orders found
                                    </p>
                                ))}

                            {/* REQUESTS */}
                            {activeTab === "requests" &&
                                requests.map((r) => (
                                    <div
                                        key={r._id}
                                        className="bg-white shadow p-5 rounded-lg border-l-4 border-amber-900"
                                    >
                                        <h3 className="text-lg font-semibold">{r.title}</h3>
                                        {r.image && (
                                            <img
                                                src={r.image}
                                                className="w-full h-40 object-cover rounded mt-3"
                                            />
                                        )}
                                        <p className="mt-2 text-sm"><b>Type:</b> {r.type}</p>
                                        <p className="text-sm"><b>Description:</b> {r.description}</p>
                                        <p className="text-sm"><b>Budget:</b> ₹{r.budget}</p>
                                        <p className="text-sm"><b>Required By:</b> {r.requiredBy}</p>
                                    </div>
                                ))}

                            {/* WORKSHOPS */}
                            {activeTab === "workshops" &&
                                workshops.map((w) => (
                                    <div
                                        key={w._id}
                                        className="bg-white shadow p-5 rounded-lg border-l-4 border-amber-900"
                                    >
                                        <h3 className="text-lg font-semibold">{w.workshopTitle}</h3>
                                        <p className="mt-2 text-sm"><b>Description:</b> {w.workshopDescription}</p>
                                        <p className="text-sm"><b>Date:</b> {w.date}</p>
                                        <p className="text-sm"><b>Time:</b> {w.time}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </main>

            <CustomerFooter />
        </>
    );
}
