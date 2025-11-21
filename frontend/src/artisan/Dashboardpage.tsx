"use client";

import { useState, useEffect } from "react";
import { EditProductModal } from "../components/ui/EditProductModal";
import { DeleteConfirmationModal } from "../components/ui/DeleteConfirmationModal";
import { craftStyles, cn } from "../styles/theme";
import Hero from "./components/Hero";
import StatsOverview from "./components/StatsOverview";
import ChartsSection from "./components/ChartsSection";
import ProductsList from "./components/ProductsList";

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
      <Hero title="Artisan Dashboard" subtitle="Where creativity meets commerce" addLink="/artisan/add-listing" />

      <main className={cn(craftStyles.layout.section)}>
        <div className={cn(craftStyles.layout.container)}>
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
            products={products}
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