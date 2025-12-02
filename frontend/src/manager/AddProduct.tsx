import React, { useState } from "react";
import { ProductForm } from "../components/forms/ProductForm";
import api from "../lib/axios";
import { CheckCircle, AlertCircle } from "lucide-react";

const AddProduct: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const p = res.data?.product ?? res.data ?? {};
      const normalized = {
        _id: String(p._id ?? p.id ?? `${Date.now()}-${Math.random()}`),
        category: p.category ?? p.type ?? "",
        image:
          p.image ??
          (Array.isArray(p.images) ? p.images[0] : p.thumbnail) ??
          "",
        name: p.name ?? p.title ?? "Untitled",
        oldPrice: Number(p.oldPrice ?? p.price ?? 0),
        newPrice: Number(p.newPrice ?? p.price ?? 0),
        quantity: Number(p.quantity ?? p.stock ?? 0),
        status: p.status ?? "active",
        description: p.description ?? p.desc ?? "",
      };

      try {
        window.dispatchEvent(
          new CustomEvent("artisan:product-created", { detail: normalized })
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore
      }

      setSuccess("Listing created successfully!");
      return res.data;
    } catch (e) {
      console.error("Failed to create listing", e);
      setError("Failed to create listing. Please try again.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 font-baloo mb-2">
            Create New Listing
          </h1>
          <p className="text-amber-700 font-baloo text-lg">
            Add a new product to your collection
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center justify-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 max-w-md">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-green-800 font-baloo text-sm">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-600 hover:text-green-800 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 max-w-md">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-800 font-baloo text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-amber-900 font-baloo mt-4">
                Creating listing...
              </p>
            </div>
          </div>
        )}

        <ProductForm
          onSubmit={handleCreate}
          submitButtonText="Create Listing"
          onSuccess={() => {
            /* handled in handleCreate */
          }}
        />
      </div>
    </div>
  );
};

export default AddProduct;
