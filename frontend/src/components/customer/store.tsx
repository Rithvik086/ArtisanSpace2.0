import React, { useEffect, useMemo, useRef, useState } from "react";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";

type Product = {
    _id: string;
    name: string;
    image?: string;
    category?: string;
    newPrice?: number;
    description?: string;
};

const isValidSearch = (q: string) => /^[a-zA-Z0-9\s\-]{1,80}$/.test(q);

export default function Store() {
    const [userId, setUserId] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);
    const [notifications, setNotifications] = useState<
        { id: string; type: "success" | "error"; message: string }[]
    >([]);

    const categoriesList = [
        "statue",
        "painting",
        "footware",
        "pottery",
        "toys",
        "headware",
        "musical instrument",
        "other",
    ];

    const dummyProducts: Product[] = [
        {
            _id: "d1",
            name: "Handmade Lamp",
            image: "/images/dummy/lamp.jpg",
            category: "pottery",
            newPrice: 799,
            description: "Warm handmade lamp to light your room.",
        },
        {
            _id: "d2",
            name: "Decor Plate",
            image: "/images/dummy/plate.jpg",
            category: "pottery",
            newPrice: 399,
            description: "Decorative plate for tabletop and display.",
        },
        {
            _id: "d3",
            name: "Clay Vase",
            image: "/images/dummy/vase.jpg",
            category: "pottery",
            newPrice: 599,
            description: "Hand-shaped vase with natural finish.",
        },
        {
            _id: "d4",
            name: "Wooden Toy Car",
            image: "/images/dummy/toy.jpg",
            category: "toys",
            newPrice: 299,
            description: "Classic wooden toy car.",
        },
        {
            _id: "d5",
            name: "Mini Sculpture",
            image: "/images/dummy/sculpture.jpg",
            category: "statue",
            newPrice: 1299,
            description: "Hand-carved mini sculpture.",
        },
    ];

    const notify = (msg: string, type: "success" | "error" = "success") => {
        const id = Date.now().toString();
        setNotifications((prev) => [...prev, { id, type, message: msg }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
    };

    const fetchOrDummy = async <T,>(
        url: string,
        dummy: T,
        setter: (d: T) => void
    ) => {
        try {
            const res = await fetch(url);
            if (res.ok) setter(await res.json());
            else setter(dummy);
        } catch {
            setter(dummy);
        }
    };

    useEffect(() => {
        (async () => {
            // fetch user
            try {
                const r = await fetch("/customer/api/user");
                if (r.ok) {
                    const u = await r.json();
                    setUserId(u.id || null);
                }
            } catch {
                setUserId(null);
            }

            const urlParams = new URLSearchParams(window.location.search);
            const categories = urlParams.getAll("category");
            const page = Number(urlParams.get("page")) || 1;

            setSelectedCategories(categories);
            setCurrentPage(page);

            await loadProducts(categories, page);

            // preload all for search
            try {
                const res = await fetch("/customer/api/products?limit=all");
                if (res.ok) {
                    const data = await res.json();
                    setAllProducts(data.products || dummyProducts);
                } else {
                    setAllProducts(dummyProducts);
                }
            } catch {
                setAllProducts(dummyProducts);
            }
        })();
    }, []);

    const loadProducts = async (cats: string[], page: number) => {
        try {
            const params = new URLSearchParams();
            cats.forEach((c) => params.append("category", c));
            params.set("page", String(page));
            params.set("limit", "12");

            const res = await fetch(`/customer/api/products?${params.toString()}`);
            if (!res.ok) throw new Error();

            const data = await res.json();
            setProducts(data.products || dummyProducts);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.currentPage || page);
        } catch {
            notify("Server failed — showing sample items", "error");

            const big = [...dummyProducts, ...dummyProducts, ...dummyProducts];
            const start = (page - 1) * 12;
            setProducts(big.slice(start, start + 12));
            setTotalPages(Math.ceil(big.length / 12));
            setCurrentPage(page);
        }
    };

    const toggleCategory = (v: string) => {
        setSelectedCategories((prev) => {
            const next = prev.includes(v) ? prev.filter((c) => c !== v) : [...prev, v];
            loadProducts(next, 1);
            return next;
        });
    };

    const changePage = (page: number) => {
        loadProducts(selectedCategories, page);
    };

    const addToCart = async (pid: string) => {
        try {
            const r = await fetch(`/customer/store?userId=${userId}&productId=${pid}`, {
                method: "POST",
            });
            const d = await r.json();
            if (d.success) notify("Added to cart");
            else notify("Failed to add", "error");
        } catch {
            notify("Added locally (dummy)", "success");
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            setShowValidationMessage(false);
            setSearchResults([]);
            return;
        }

        if (!isValidSearch(searchQuery)) {
            setShowValidationMessage(true);
            setSearchResults([]);
            return;
        }

        setShowValidationMessage(false);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = window.setTimeout(() => {
            const q = searchQuery.toLowerCase();
            const results = allProducts.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
            );
            setSearchResults(results.slice(0, 10));
        }, 250) as any;
    }, [searchQuery]);

    const productList = useMemo(() => products, [products]);

    return (
        <>
            <CustomerHeader />

            <div className="min-h-screen bg-[#f8f5f2] pt-28 pb-20 px-4 md:px-10 lg:px-16 text-amber-900" style={{padding:'2rem'}} >

                {/* GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* SIDEBAR */}
                    <aside className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow border p-6 space-y-6 sticky top-32" style={{padding:'1rem'}} >

                            <h3 className="text-xl font-semibold text-amber-900">Filters</h3>

                            {/* Categories */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Category</h4>

                                <div className="space-y-2">
                                    {categoriesList.map((cat) => (
                                        <label
                                            key={cat}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat)}
                                                onChange={() => toggleCategory(cat)}
                                                className="w-4 h-4"
                                            />
                                            <span className="capitalize text-base">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Quick Actions</h4>

                                <button
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        loadProducts([], 1);
                                    }}
                                    className="w-full py-3 rounded-lg bg-amber-900 text-white text-lg font-semibold hover:bg-amber-800"
                                >
                                    Clear Filters
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedCategories(["pottery"]);
                                        loadProducts(["pottery"], 1);
                                    }}
                                    className="w-full mt-3 py-3 rounded-lg border text-lg font-semibold hover:bg-gray-50"
                                >
                                    Show Pottery
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <section className="lg:col-span-9">

                        {/* Search */}
                        <div className="max-w-3xl mb-10">
                            <div className="relative">
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-3 px-5 rounded-xl border border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-200 outline-none"
                                    placeholder="Search products (name, category, description)..."
                                />

                                {showValidationMessage && (
                                    <p className="text-sm text-red-500 mt-2">
                                        Only letters, numbers, spaces & hyphens allowed.
                                    </p>
                                )}

                                {searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 bg-white border rounded-xl shadow mt-2 z-40 max-h-80 overflow-auto">
                                        {searchResults.map((r) => (
                                            <a
                                                key={r._id}
                                                href={`/products/${r._id}`}
                                                className="flex gap-3 p-3 hover:bg-gray-50 border-b"
                                            >
                                                <img
                                                    src={r.image || "/images/product-placeholder.jpg"}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <h4 className="font-medium">{r.name}</h4>
                                                    <p className="text-xs text-gray-500">
                                                        {r.category} • ₹{r.newPrice}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PRODUCT GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {productList.map((p) => (
                                <div
                                    key={p._id}
                                    className="bg-white rounded-xl shadow border p-4 flex flex-col gap-3 hover:shadow-lg transition"
                                    style={{padding:'1rem'}}
                                >
                                    <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={p.image}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">{p.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                                        <p className="mt-1 text-amber-900 font-semibold">
                                            ₹{p.newPrice}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => addToCart(p._id)}
                                        className="mt-auto py-2 w-full bg-amber-900 text-white rounded-lg font-semibold hover:bg-amber-800"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-center mt-10 gap-3">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => changePage(currentPage - 1)}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => changePage(n)}
                                    className={`px-4 py-2 rounded-lg ${
                                        n === currentPage
                                            ? "bg-amber-900 text-white"
                                            : "border hover:bg-gray-50"
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}

                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => changePage(currentPage + 1)}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </section>
                </div>

                {/* NOTIFICATIONS */}
                <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`px-4 py-3 rounded-lg shadow ${
                                n.type === "success"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                            {n.message}
                        </div>
                    ))}
                </div>
            </div>

            <CustomerFooter />
        </>
    );
}
