import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import api from "../../lib/axios";

interface Product {
  id: string;
  image: string;
  name: string;
  uploadedBy: string;
  quantity: number;
  oldPrice: number;
  newPrice: number;
  category: string;
  status: "approved" | "pending" | "disapproved";
}

export default function ModerationProductCard({
  product,
  onModerated,
}: {
  product: Product;
  onModerated?: (id: string, status: "approved" | "disapproved") => void;
}): React.ReactElement {
  const { dispatch } = useAppContext();
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
        if (action === "approve") {
          dispatch({ type: "APPROVE_PRODUCT", payload: product.id });
          onModerated?.(product.id, "approved");
        } else {
          dispatch({ type: "DISAPPROVE_PRODUCT", payload: product.id });
          onModerated?.(product.id, "disapproved");
        }
      } else {
        console.error("Moderation failed", {
          status: res.status,
          body: res.data,
        });
        const errMsg =
          res.data?.error ||
          res.data?.message ||
          "Failed to update product status.";
        alert(`Moderation failed: ${errMsg}`);
      }
    } catch (e) {
      console.error("Error moderating product", e);
      alert("Failed to update product status.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (): void => {
    void doModeration("approve");
  };
  const handleDisapprove = (): void => {
    void doModeration("disapprove");
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
            <p className="text-sm text-stone-500">by {product.uploadedBy}</p>
            <p className="text-sm text-stone-500">{product.category}</p>
            <div className="mt-1">
              <span className="text-lg font-bold text-amber-900">
                ₹{product.newPrice.toFixed(2)}
              </span>
              <s className="text-sm text-stone-400 ml-2">
                ₹{product.oldPrice.toFixed(2)}
              </s>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 px-4 py-3 flex justify-end gap-3">
        {product.status !== "approved" && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className={`px-3 py-1 bg-green-500 text-white rounded-md ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:brightness-95 cursor-pointer"
            }`}
          >
            Approve
          </button>
        )}
        {product.status !== "disapproved" && (
          <button
            onClick={handleDisapprove}
            disabled={loading}
            className={`px-3 py-1 bg-red-500 text-white rounded-md ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:brightness-95 cursor-pointer"
            }`}
          >
            Disapprove
          </button>
        )}
      </div>
    </div>
  );
}
