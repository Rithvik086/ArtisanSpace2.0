"use client";

import React, { useEffect, useState } from "react";
import { EditProductModal } from "../components/ui/EditProductModal";
import { DeleteConfirmationModal } from "../components/ui/DeleteConfirmationModal";
import { craftStyles, cn } from "../styles/theme";
import type { Product as ProductType } from "./Dashboardpage";
import { ProductForm } from "../components/forms/ProductForm";
import api from "../lib/axios";
import { useToast } from "../components/ui/ToastProvider";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ListingsPage(): React.ReactElement {
  const [, setProducts] = useState<ProductType[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let res = await api.get("/products/my");
        if (res.status === 401 || res.status === 403) {
          res = await api.get("/products/approved");
        }
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.products ?? res.data?.data ?? [];
        const normalized = (list as any[]).map((p: any) => ({
          _id: String(p._id ?? p.id ?? `${Date.now()}-${Math.random()}`),
          category: p.category ?? p.type ?? "",
          image: p.image,
          name: p.name ?? p.title ?? "Untitled",
          oldPrice: Number(p.oldPrice ?? p.price ?? 0),
          newPrice: Number(p.newPrice ?? p.price ?? 0),
          quantity: Number(p.quantity ?? p.stock ?? 0),
          status:
            (p.status === "disapproved" ? "rejected" : p.status) ?? "active",
          description: p.description ?? p.desc ?? "",
        }));
        setProducts(normalized as ProductType[]);
      } catch (e) {
        console.error("Failed to load listings", e);
        setProducts([]);
      }
    };

    void fetchProducts();
  }, []);

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
        image: p.image,
        name: p.name ?? p.title ?? "Untitled",
        oldPrice: Number(p.oldPrice ?? p.price ?? 0),
        newPrice: Number(p.newPrice ?? p.price ?? 0),
        quantity: Number(p.quantity ?? p.stock ?? 0),
        status:
          (p.status === "disapproved" ? "rejected" : p.status) ?? "active",
        description: p.description ?? p.desc ?? "",
      } as ProductType;

      // add to list
      setProducts((prev) => [normalized, ...prev]);
      // notify other artisan pages (e.g. Dashboard) about the new product so they can update immediately
      try {
        window.dispatchEvent(
          new CustomEvent("artisan:product-created", { detail: normalized })
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        /* empty */
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

  // these are not used
  // const handleEdit = (p: ProductType) => {
  //   setSelectedProduct(p);
  //   setIsEditModalOpen(true);
  // };
  // const handleDeleteOpen = (id: string) => {
  //   setProductToDeleteId(id);
  //   setIsDeleteOpen(true);
  // };

  const handleSave = (updated: ProductType) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const { showToast } = useToast();

  const handleConfirmDelete = async () => {
    if (!productToDeleteId) return;
    setLoading(true);
    try {
      await api.delete(`/products/${productToDeleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productToDeleteId));
      showToast("Listing deleted successfully", "success");
    } catch (e) {
      console.error("Failed to delete listing", e);
      setError("Failed to delete listing. Please try again.");
      showToast("Failed to delete listing", "error");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setProductToDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className={cn(craftStyles.layout.container, "py-6")}>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 font-baloo mb-2">
            Create New Listing
          </h1>
          <p className="text-amber-700 font-baloo text-lg">
            Add a new product to your artisan collection
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

      {/* <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-amber-900 mb-4">Your Listings</h2>
        <p className="text-amber-700 mb-6">Manage and view all your product listings.</p>
        <ProductTable products={products} onEdit={handleEdit} onDelete={handleDeleteOpen} />
      </div> */}

      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onSave={handleSave}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
