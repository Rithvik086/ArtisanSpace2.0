"use client";

import { useState, useEffect } from "react";
import { SalesChart } from "../components/ui/SalesChart";
import { ProductsChart } from "../components/ui/ProductsChart";
import { ProductTable } from "../components/ui/ProductTable";
import { EditProductModal } from "../components/ui/EditProductModal";
import { DeleteConfirmationModal } from "../components/ui/DeleteConfirmationModal";
import { craftStyles, cn } from "../styles/theme";
import { Plus, Palette, TrendingUp, Package, Eye } from "lucide-react";
import { Link } from "react-router-dom";

// TypeScript interfaces
interface Product {
  _id: string;
  category: string;
  image: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
  description: string;
}

// We'll load products from the backend (remove previous mock data)

export default function ArtisanDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

  // Fetch artisan products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || `${location.protocol}//${location.hostname}:3000`;
        // Try to fetch the artisan's products (requires auth)
        let res = await fetch(`${API_BASE}/api/v1/products/my`, { credentials: 'include' });

        // If not authorized, fall back to public approved listing
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            res = await fetch(`${API_BASE}/api/v1/products/approved`);
          }
        }

        const json = await res.json().catch(() => []);
        const list = Array.isArray(json) ? json : (json?.products ?? json?.data ?? []);

        const normalized = (list as any[]).map((p: any) => ({
          _id: String(p._id ?? p.id ?? crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
          category: p.category ?? p.type ?? '',
          image: p.image ?? (Array.isArray(p.images) ? p.images[0] : p.thumbnail) ?? '',
          name: p.name ?? p.title ?? 'Untitled',
          oldPrice: Number(p.oldPrice ?? p.price ?? 0),
          newPrice: Number(p.newPrice ?? p.price ?? 0),
          quantity: Number(p.quantity ?? p.stock ?? 0),
          status: p.status ?? 'active',
          description: p.description ?? p.desc ?? '',
        }));

        setProducts(normalized as Product[]);
      } catch (e) {
        console.error('Failed to load products', e);
        setProducts([]);
      }
    };

    void fetchProducts();
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
    
    setProducts(products.map(p =>
      p._id === updatedProductData._id ? updatedProductData : p
    ));
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

  const handleConfirmDelete = (): void => {
    // In a real app, send this to your API
    // await fetch(`/api/artisan/products/${productToDeleteId}`, {
    //   method: 'DELETE'
    // });

    setProducts(products.filter(p => p._id !== productToDeleteId));
    console.log("Deleting product:", productToDeleteId);
    handleCloseDeleteModal();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50">
  {/* Hero section below the header */}
      <div className={cn(craftStyles.layout.container, "py-6")}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 font-serif">
              <Palette className="inline-block w-8 h-8 mr-3 text-amber-600" />
              Artisan Dashboard
            </h1>
            <p className="text-amber-700 mt-2 text-lg">Where creativity meets commerce</p>
          </div>
          {/* Add button sits to the right of the hero */}
          <div>
            <Link
              to="/artisan/add-listing"
              className={cn(craftStyles.button.primary, "flex items-center gap-2")}
            >
              <Plus className="w-5 h-5" />
              Add New Creation
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn(craftStyles.layout.container, craftStyles.layout.section)}>
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Products Card */}
          <div className={cn(craftStyles.card.warm, "p-6")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">Total Creations</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{products.length}</p>
              </div>
              <Package className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          {/* Active Products Card */}
          <div className={cn(craftStyles.card.warm, "p-6")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">Active Listings</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Eye className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          {/* Performance Card */}
          <div className={cn(craftStyles.card.warm, "p-6")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">This Month</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">₹15,240</p>
              </div>
              <TrendingUp className="w-12 h-12 text-amber-600" />
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className={cn(craftStyles.card.default, "p-6")}>
            <h3 className="text-xl font-semibold text-amber-900 mb-4 font-serif">Sales Analytics</h3>
            <SalesChart />
          </div>
          <div className={cn(craftStyles.card.default, "p-6")}>
            <h3 className="text-xl font-semibold text-amber-900 mb-4 font-serif">Product Performance</h3>
            <ProductsChart 
              total={products.length}
              active={products.filter(p => p.status === 'active').length}
              pending={products.filter(p => p.status === 'pending').length}
            />
          </div>
        </section>

        {/* Products Management Section */}
        <section className={cn(craftStyles.card.default, "p-6")}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-amber-900 font-serif">
                Your Creations
              </h2>
              <p className="text-amber-700 mt-1">Manage your handcrafted treasures</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {products.length} Products
              </span>
            </div>
          </div>
          <ProductTable
            products={products}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
        </section>
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