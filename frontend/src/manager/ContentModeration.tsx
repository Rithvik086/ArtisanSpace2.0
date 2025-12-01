import React, { useEffect, useState } from "react";
import api from "../lib/axios";

interface ProductItem {
  id: string;
  image: string;
  name: string;
  uploadedBy?: string;
  quantity?: number;
  oldPrice?: number;
  newPrice?: number;
  category?: string;
  status?: "approved" | "pending" | "disapproved";
  description?: string;
}

const ContentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "approved" | "pending" | "disapproved"
  >("pending");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        status: (p.status as ProductItem["status"]) ?? "pending",
        description: p.description ?? p.desc ?? "",
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

  const handleLocalStatusUpdate = (
    id: string,
    newStatus: "approved" | "disapproved"
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const approvedProducts = products.filter((p) => p.status === "approved");
  const pendingProducts = products.filter((p) => p.status === "pending");
  const disapprovedProducts = products.filter(
    (p) => p.status === "disapproved"
  );

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
      <div className="border-b border-amber-200 mb-4">
        <div className="flex -mb-px">
          <div
            className={`py-3 px-4 font-medium text-center cursor-pointer ${
              activeTab === "approved"
                ? "border-b-2 border-amber-500 text-amber-600"
                : "text-stone-500 hover:text-stone-700"
            }`}
            onClick={() => setActiveTab("approved")}
          >
            Approved{" "}
            <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              {approvedProducts.length}
            </span>
          </div>
          <div
            className={`py-3 px-4 font-medium text-center cursor-pointer ${
              activeTab === "pending"
                ? "border-b-2 border-amber-500 text-amber-600"
                : "text-stone-500 hover:text-stone-700"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending{" "}
            <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              {pendingProducts.length}
            </span>
          </div>
          <div
            className={`py-3 px-4 font-medium text-center cursor-pointer ${
              activeTab === "disapproved"
                ? "border-b-2 border-amber-500 text-amber-600"
                : "text-stone-500 hover:text-stone-700"
            }`}
            onClick={() => setActiveTab("disapproved")}
          >
            Disapproved{" "}
            <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
              {disapprovedProducts.length}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading products…</p>
      ) : (
        <div className="py-6">
          {activeTab === "approved" &&
            (approvedProducts.length === 0 ? (
              <p className="text-stone-500 text-center py-10">
                No products in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedProducts.map((p) => (
                  <ManagerCard
                    key={p.id}
                    product={p}
                    onModerated={handleLocalStatusUpdate}
                  />
                ))}
              </div>
            ))}

          {activeTab === "pending" &&
            (pendingProducts.length === 0 ? (
              <p className="text-stone-500 text-center py-10">
                No products in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProducts.map((p) => (
                  <ManagerCard
                    key={p.id}
                    product={p}
                    onModerated={handleLocalStatusUpdate}
                  />
                ))}
              </div>
            ))}

          {activeTab === "disapproved" &&
            (disapprovedProducts.length === 0 ? (
              <p className="text-stone-500 text-center py-10">
                No products in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {disapprovedProducts.map((p) => (
                  <ManagerCard
                    key={p.id}
                    product={p}
                    onModerated={handleLocalStatusUpdate}
                  />
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

function ManagerCard({
  product,
  onModerated,
}: {
  product: ProductItem;
  onModerated: (id: string, status: "approved" | "disapproved") => void;
}) {
  const [loading, setLoading] = useState(false);

  const doModeration = async (action: "approve" | "disapprove") => {
    try {
      setLoading(true);
      const res = await api.post(
        `/products/moderation?action=${action}&productId=${encodeURIComponent(
          product.id
        )}`
      );
      if (res.status === 200 && res.data && res.data.success) {
        const newStatus = action === "approve" ? "approved" : "disapproved";
        onModerated(product.id, newStatus);
      } else {
        const err = res.data?.error || res.data?.message || "Moderation failed";
        alert(`Moderation failed: ${err}`);
      }
    } catch (e) {
      console.error("Moderation error", e);
      alert("Failed to perform moderation action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-amber-200 overflow-hidden">
      <div className="p-4">
        <div className="flex gap-4">
          <img
            className="h-20 w-20 rounded-md object-cover shrink-0"
            src={product.image}
            alt={product.name}
          />
          <div className="grow">
            <h4 className="text-md font-semibold text-amber-900">
              {product.name}
            </h4>
            <p className="text-sm text-stone-500">
              by {product.uploadedBy ?? "unknown"}
            </p>
            <p className="text-sm text-stone-500">{product.category}</p>
            <div className="mt-1">
              <span className="text-lg font-bold text-amber-900">
                ₹{(product.newPrice ?? 0).toFixed(2)}
              </span>
              <s className="text-sm text-stone-400 ml-2">
                ₹{(product.oldPrice ?? 0).toFixed(2)}
              </s>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 px-4 py-3 flex justify-end gap-3">
        {product.status !== "approved" && (
          <button
            onClick={() => void doModeration("approve")}
            disabled={loading}
            className={`px-3 py-1 bg-green-500 text-white rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:brightness-95"
            }`}
          >
            Approve
          </button>
        )}
        {product.status !== "disapproved" && (
          <button
            onClick={() => void doModeration("disapprove")}
            disabled={loading}
            className={`px-3 py-1 bg-red-500 text-white rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:brightness-95"
            }`}
          >
            Disapprove
          </button>
        )}
      </div>
    </div>
  );
}

export default ContentModeration;
