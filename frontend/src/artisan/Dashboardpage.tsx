"use client";

import { useState, useEffect, useMemo } from "react";
import { EditProductModal } from "../components/ui/EditProductModal";
import { DeleteConfirmationModal } from "../components/ui/DeleteConfirmationModal";
import { craftStyles, cn } from "../styles/theme";
import Hero from "./components/Hero";
import StatsOverview from "./components/StatsOverview";
import ChartsSection from "./components/ChartsSection";
import ProductsList from "./components/ProductsList";
import api from "../lib/axios";
import { useToast } from "../components/ui/ToastProvider";
import { Search, AlertCircle } from "lucide-react";

// TypeScript interfaces
interface Product {
  _id: string;
  category: string;
  image: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  status: "active" | "pending" | "inactive" | "rejected";
  description: string;
}

// We'll load products from the backend (remove previous mock data)

export default function ArtisanDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreationsPanel, setShowCreationsPanel] = useState<boolean>(false);
  const [creationFilter, setCreationFilter] = useState<
    "all" | "active" | "pending" | "rejected"
  >("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch artisan products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        // Try to fetch the artisan's products (requires auth)
        let res = await api.get("/products/my");

        // If not authorized, fall back to public approved listing
        if (res.status === 401 || res.status === 403) {
          res = await api.get("/products/approved");
        }

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.products ?? res.data?.data ?? [];

        const normalized = (list as any[]).map((p: any) => ({
          _id: String(
            p._id ??
              p.id ??
              crypto?.randomUUID?.() ??
              `${Date.now()}-${Math.random()}`
          ),
          category: p.category ?? p.type ?? "",
          image:
            p.image ??
            (Array.isArray(p.images) ? p.images[0] : p.thumbnail) ??
            "",
          name: p.name ?? p.title ?? "Untitled",
          oldPrice: Number(p.oldPrice ?? p.price ?? 0),
          newPrice: Number(p.newPrice ?? p.price ?? 0),
          quantity: Number(p.quantity ?? p.stock ?? 0),
          status:
            (p.status === "disapproved"
              ? "rejected"
              : p.status === "approved"
              ? "active"
              : p.status) ?? "pending",
          description: p.description ?? p.desc ?? "",
        }));

        setProducts(normalized as Product[]);
      } catch (e) {
        console.error("Failed to load products", e);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();

    // Listen for products created elsewhere (ListingsPage) and prepend them
    const onCreated = (e: any) => {
      try {
        const p = e?.detail;
        if (!p) return;
        setProducts((prev) => [p, ...prev]);
      } catch (err) {
        /* ignore */
      }
    };
    window.addEventListener(
      "artisan:product-created",
      onCreated as EventListener
    );

    return () => {
      window.removeEventListener(
        "artisan:product-created",
        onCreated as EventListener
      );
    };
  }, []);

  // --- Edit Handlers ---
  const handleOpenEditModal = (product: Product): void => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = (): void => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = (updatedProductData: Product): void => {
    // In a real app, send this to your API
    // await fetch(`/api/artisan/products/${updatedProductData._id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(updatedProductData)
    // });

    setProducts(
      products.map((p) =>
        p._id === updatedProductData._id ? updatedProductData : p
      )
    );
    console.log("Saving product:", updatedProductData);
    handleCloseEditModal();
  };

  // --- Delete Handlers ---
  const handleOpenDeleteModal = (productId: string): void => {
    setProductToDeleteId(productId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setProductToDeleteId(null);
  };

  const { showToast } = useToast();

  const handleConfirmDelete = async (): Promise<void> => {
    if (!productToDeleteId) return;
    try {
      setLoading(true);
      await api.delete(`/products/${productToDeleteId}`);
      setProducts(products.filter((p) => p._id !== productToDeleteId));
      showToast("Product deleted successfully", "success");
    } catch (e) {
      console.error("Failed to delete product", e);
      setError("Failed to delete product. Please try again.");
      showToast("Failed to delete product", "error");
    } finally {
      setLoading(false);
      handleCloseDeleteModal();
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesFilter =
        creationFilter === "all" ||
        (creationFilter === "active" && p.status === "active") ||
        (creationFilter === "pending" && p.status === "pending") ||
        (creationFilter === "rejected" && p.status === "rejected");

      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [products, creationFilter, searchTerm]);

  const newLocal = "w-5 h-5 text-red-600 flex-shrink-0";
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Hero
        title="Artisan Dashboard"
        subtitle="Where creativity meets commerce"
        addLink="/artisan/listings"
        onYourCreationsClick={() => setShowCreationsPanel(true)}
      />

      <main className={cn(craftStyles.layout.section)}>
        <div className={cn(craftStyles.layout.container)}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse space-y-4">
                <div className="w-16 h-16 bg-amber-300 rounded-full mx-auto"></div>
                <div className="w-48 h-6 bg-amber-300 rounded mx-auto"></div>
                <div className="w-32 h-4 bg-amber-200 rounded mx-auto"></div>
              </div>
              <p className="text-amber-900 text-lg font-baloo mt-4 animate-bounce">
                Loading dashboard...
              </p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 max-w-md">
                <AlertCircle className={newLocal} />
                <p className="text-red-800 font-baloo text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : showCreationsPanel ? (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCreationFilter("all")}
                    className={`px-3 py-1 rounded-md font-baloo ${
                      creationFilter === "all"
                        ? "bg-amber-600 text-white"
                        : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCreationFilter("active")}
                    className={`px-3 py-1 rounded-md font-baloo ${
                      creationFilter === "active"
                        ? "bg-amber-600 text-white"
                        : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setCreationFilter("pending")}
                    className={`px-3 py-1 rounded-md font-baloo ${
                      creationFilter === "pending"
                        ? "bg-amber-600 text-white"
                        : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setCreationFilter("rejected")}
                    className={`px-3 py-1 rounded-md font-baloo ${
                      creationFilter === "rejected"
                        ? "bg-amber-600 text-white"
                        : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    Rejected
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setShowCreationsPanel(false)}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 hover:border-amber-400 transition-colors duration-200 font-baloo"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search creations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      craftStyles.input.default,
                      "pl-10 pr-4 py-2 text-amber-900 placeholder-amber-500 font-baloo"
                    )}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <ProductsList
                  products={filteredProducts}
                  isEditOpen={isEditModalOpen}
                  selectedProduct={selectedProduct}
                  onEditOpen={handleOpenEditModal}
                  onEditClose={handleCloseEditModal}
                  onSave={handleSaveProduct}
                  onDeleteOpen={handleOpenDeleteModal}
                  isDeleteOpen={isDeleteModalOpen}
                  onDeleteClose={handleCloseDeleteModal}
                  onDeleteConfirm={handleConfirmDelete}
                />
              </div>
            </div>
          ) : (
            <>
              <StatsOverview
                total={products.length}
                active={products.filter((p) => p.status === "active").length}
                monthValue={"₹15,240"}
              />

              <ChartsSection
                total={products.length}
                active={products.filter((p) => p.status === "active").length}
                pending={products.filter((p) => p.status === "pending").length}
              />

              <ProductsList
                products={products.filter((p) => p.status === "active")}
                isEditOpen={isEditModalOpen}
                selectedProduct={selectedProduct}
                onEditOpen={handleOpenEditModal}
                onEditClose={handleCloseEditModal}
                onSave={handleSaveProduct}
                onDeleteOpen={handleOpenDeleteModal}
                isDeleteOpen={isDeleteModalOpen}
                onDeleteClose={handleCloseDeleteModal}
                onDeleteConfirm={handleConfirmDelete}
              />
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          product={selectedProduct}
          onSave={handleSaveProduct}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// Export the Product interface for use in other components
export type { Product };
