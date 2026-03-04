import React, { useState, useEffect } from "react";
import { ProductForm } from "../components/forms/ProductForm";
import { BulkUploadModal } from "../components/ui/BulkUploadModal";
import { UpdateImageModal } from "../components/ui/UpdateImageModal";
import { ProductCard } from "../components/ProductCard";
import api from "../lib/axios";
import { CheckCircle, AlertCircle } from "lucide-react";
import { craftStyles } from "../styles/theme";

interface Product {
  _id: string;
  name: string;
  image: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  category: string;
  status: "active" | "pending" | "inactive" | "rejected";
  description: string;
}

const AddProduct: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isImageUpdateOpen, setIsImageUpdateOpen] = useState<boolean>(false);
  const [selectedProductForImageUpdate, setSelectedProductForImageUpdate] =
    useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(
    null,
  );

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/all");
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.products ?? res.data?.data ?? []);
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
      setProducts(normalized);
    } catch (e) {
      console.error("Failed to load products", e);
      setProducts([]);
    }
  };

  useEffect(() => {
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
          new CustomEvent("artisan:product-created", { detail: normalized }),
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

  const handleUpdateImageClick = (
    productId: string,
    productName: string,
    currentImage: string,
  ) => {
    setSelectedProductForImageUpdate({
      _id: productId,
      name: productName,
      image: currentImage,
      category: "",
      oldPrice: 0,
      newPrice: 0,
      quantity: 0,
      status: "active",
      description: "",
    });
    setIsImageUpdateOpen(true);
  };

  const handleImageUpdateSuccess = (newImageUrl: string) => {
    if (selectedProductForImageUpdate) {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProductForImageUpdate._id
            ? { ...p, image: newImageUrl }
            : p,
        ),
      );
      setSuccess("Product image updated successfully!");
      setIsImageUpdateOpen(false);
      setSelectedProductForImageUpdate(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDeleteId) return;
    setLoading(true);
    try {
      await api.delete(`/products/${productToDeleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productToDeleteId));
      setSuccess("Product deleted successfully");
    } catch (e) {
      console.error("Failed to delete product", e);
      setError("Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setProductToDeleteId(null);
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 font-baloo mb-2">
              Create New Listing
            </h1>
            <p className="text-amber-700 font-baloo text-lg">
              Add a new product to your collection
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setIsBulkOpen(true)}
              className={craftStyles.button.primary}
            >
              Bulk Upload
            </button>
          </div>
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

        <BulkUploadModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          onSubmit={async (items) => {
            try {
              setLoading(true);
              const res = await api.post("/products/bulk", { products: items });
              console.log("bulk response", res.data);
              const data = res.data || {};
              if (Array.isArray(data.results)) {
                const successCount = data.results.filter(
                  (r: any) => r.success,
                ).length;
                const failCount = data.results.length - successCount;
                setSuccess(
                  `Bulk: ${successCount} succeeded, ${failCount} failed`,
                );
              } else {
                setSuccess("Bulk upload completed");
              }
              setIsBulkOpen(false); // close modal
              await fetchProducts();
              return res.data;
            } catch (e: any) {
              setError("Bulk upload failed");
              throw e;
            } finally {
              setLoading(false);
            }
          }}
        />

        {/* Product Listings Section */}
        {products.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-amber-900 font-baloo mb-2">
              All Products
            </h2>
            <p className="text-amber-700 font-baloo text-lg mb-6">
              Manage all products - hover over images to update or delete
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  {...product}
                  onUpdateImage={handleUpdateImageClick}
                  onDelete={(id) => {
                    setProductToDeleteId(id);
                    setIsDeleteOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProductForImageUpdate && (
        <UpdateImageModal
          isOpen={isImageUpdateOpen}
          onClose={() => {
            setIsImageUpdateOpen(false);
            setSelectedProductForImageUpdate(null);
          }}
          productName={selectedProductForImageUpdate.name}
          productId={selectedProductForImageUpdate._id}
          currentImageUrl={selectedProductForImageUpdate.image}
          onSuccess={handleImageUpdateSuccess}
        />
      )}

      {isDeleteOpen && productToDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-amber-700 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setProductToDeleteId(null);
                }}
                className={craftStyles.button.secondary + " flex-1"}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold flex-1 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
