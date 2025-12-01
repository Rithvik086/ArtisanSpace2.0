import React, { useEffect, useState } from "react";
import ModerationProductCard from "./components/ModerationProductCard";
import { useAppContext } from "./AppContext";
import api from "../lib/axios";

export default function ContentModerationPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>("pending");
  const { state } = useAppContext();
  const ctxProducts = state.products;

  const [products, setProducts] = useState<any[]>(ctxProducts || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const approvedProducts = products.filter((p) => p.status === "approved");
  const pendingProducts = products.filter((p) => p.status === "pending");
  const disapprovedProducts = products.filter(
    (p) => p.status === "disapproved"
  );

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Try multiple endpoints to support different role-protected routes.
      const endpoints = [
        "/admin/products",
        "/products/all",
        "/manager/products",
      ];
      let res: any = null;
      let data: any = null;
      let items: any[] = [];

      for (const ep of endpoints) {
        try {
          res = await api.get(`${ep}?limit=10000`);
          if (res && (res.status === 200 || res.status === 201)) {
            data = res.data;
            items = Array.isArray(data?.products ? data.products : data)
              ? data.products ?? data
              : [];
            if (items.length > 0) break; // stop if we got products
            // even if empty array that's valid - break
            break;
          }
        } catch (e: any) {
          // on 401/403 try next endpoint, otherwise bubble after trying all
          if (
            e?.response &&
            (e.response.status === 401 || e.response.status === 403)
          ) {
            continue;
          }
        }
      }
      const normalized = (items as any[]).map((p) => ({
        id: String(p._id || p.id),
        image: p.image ?? p.images?.[0] ?? p.thumbnail ?? "",
        name: p.name ?? p.title ?? "Untitled",
        uploadedBy: p.uploadedBy ?? (p.userId ? String(p.userId) : ""),
        quantity: Number(p.quantity ?? p.number ?? p.stock ?? 0),
        oldPrice: Number(p.oldPrice ?? p.price ?? 0),
        newPrice: Number(p.newPrice ?? p.price ?? 0),
        category: p.category ?? "",
        status:
          (p.status as "approved" | "pending" | "disapproved") ?? "pending",
      }));
      setProducts(normalized);
    } catch (e) {
      console.error("Failed to load products for moderation", e);
      setProducts([]);
      setError("Failed to load products for moderation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const getTabClass = (tabName: string): string =>
    `py-3 px-4 font-medium text-center cursor-pointer ${
      activeTab === tabName
        ? "border-b-2 border-amber-500 text-amber-600"
        : "text-stone-500 hover:text-stone-700"
    }`;

  const getTabContent = (): React.ReactElement => {
    let productsToShow: any[] = [];
    switch (activeTab) {
      case "approved":
        productsToShow = approvedProducts;
        break;
      case "pending":
        productsToShow = pendingProducts;
        break;
      case "disapproved":
        productsToShow = disapprovedProducts;
        break;
      default:
        productsToShow = [];
    }
    if (loading)
      return (
        <p className="text-stone-500 text-center py-10">Loading products…</p>
      );
    if (productsToShow.length === 0)
      return (
        <p className="text-stone-500 text-center py-10">
          No products in this category.
        </p>
      );
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsToShow.map((p) => (
          <ModerationProductCard
            key={p.id}
            product={p}
            onModerated={(id, status) =>
              setProducts((prev) =>
                prev.map((it) => (it.id === id ? { ...it, status } : it))
              )
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-amber-200">
      <h2 className="text-2xl font-semibold text-amber-900 mb-4 font-baloo">
        Manage Products
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center justify-between">
          <div>{error}</div>
          <div>
            <button
              className="text-sm text-red-700 underline"
              onClick={() => {
                setError(null);
                void fetchProducts();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="border-b border-amber-200">
        <div className="flex -mb-px">
          <div
            className={getTabClass("approved")}
            onClick={() => setActiveTab("approved")}
          >
            Approved{" "}
            <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              {approvedProducts.length}
            </span>
          </div>
          <div
            className={getTabClass("pending")}
            onClick={() => setActiveTab("pending")}
          >
            Pending{" "}
            <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              {pendingProducts.length}
            </span>
          </div>
          <div
            className={getTabClass("disapproved")}
            onClick={() => setActiveTab("disapproved")}
          >
            Disapproved{" "}
            <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
              {disapprovedProducts.length}
            </span>
          </div>
        </div>
      </div>
      <div className="py-6">{getTabContent()}</div>
    </div>
  );
}
