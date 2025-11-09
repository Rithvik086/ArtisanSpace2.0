"use client";

import React, { useEffect, useState } from "react";
import { ProductTable } from "../components/ui/ProductTable";
import { EditProductModal } from "../components/ui/EditProductModal";
import { DeleteConfirmationModal } from "../components/ui/DeleteConfirmationModal";
import { craftStyles, cn } from "../styles/theme";
import type { Product as ProductType } from "./Dashboardpage";
import { ProductForm } from "../components/forms/ProductForm";

export default function ListingsPage(): React.ReactElement {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || `${location.protocol}//${location.hostname}:3000`;
        let res = await fetch(`${API_BASE}/api/v1/products/my`, { credentials: "include" });
        if (!res.ok && (res.status === 401 || res.status === 403)) {
          res = await fetch(`${API_BASE}/api/v1/products/approved`);
        }
        const json = await res.json().catch(() => []);
        const list = Array.isArray(json) ? json : (json?.products ?? json?.data ?? []);
        const normalized = (list as any[]).map((p: any) => ({
          _id: String(p._id ?? p.id ?? `${Date.now()}-${Math.random()}`),
          category: p.category ?? p.type ?? "",
          image: p.image ?? (Array.isArray(p.images) ? p.images[0] : p.thumbnail) ?? "",
          name: p.name ?? p.title ?? "Untitled",
          oldPrice: Number(p.oldPrice ?? p.price ?? 0),
          newPrice: Number(p.newPrice ?? p.price ?? 0),
          quantity: Number(p.quantity ?? p.stock ?? 0),
          status: p.status ?? "active",
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
    const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || `${location.protocol}//${location.hostname}:3000`;
    const res = await fetch(`${API_BASE}/api/v1/products`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Failed to create product");
    }

    const json = await res.json().catch(() => ({}));
    const p = json?.product ?? json ?? {};
    const normalized = {
      _id: String(p._id ?? p.id ?? `${Date.now()}-${Math.random()}`),
      category: p.category ?? p.type ?? "",
      image: p.image ?? (Array.isArray(p.images) ? p.images[0] : p.thumbnail) ?? "",
      name: p.name ?? p.title ?? "Untitled",
      oldPrice: Number(p.oldPrice ?? p.price ?? 0),
      newPrice: Number(p.newPrice ?? p.price ?? 0),
      quantity: Number(p.quantity ?? p.stock ?? 0),
      status: p.status ?? "active",
      description: p.description ?? p.desc ?? "",
    } as ProductType;

    // add to list
    setProducts(prev => [normalized, ...prev]);
    return json;
  };

  const handleEdit = (p: ProductType) => {
    setSelectedProduct(p);
    setIsEditModalOpen(true);
  };
  const handleDeleteOpen = (id: string) => {
    setProductToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSave = (updated: ProductType) => {
    setProducts(prev => prev.map(p => (p._id === updated._id ? updated : p)));
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmDelete = () => {
    setProducts(prev => prev.filter(p => p._id !== productToDeleteId));
    setIsDeleteOpen(false);
    setProductToDeleteId(null);
  };

  return (
    <div className={cn(craftStyles.layout.container, "py-6")}>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold text-amber-900 mb-4">Create a Listing</h2>
        <p className="text-amber-700 mb-6">Fill the form to add a new product listing.</p>
        <ProductForm onSubmit={handleCreate} submitButtonText="Create Listing" onSuccess={() => { /* no-op, UI updates from handler */ }} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-amber-900 mb-4">Your Listings</h2>
        <p className="text-amber-700 mb-6">Manage and view all your product listings.</p>
        <ProductTable products={products} onEdit={handleEdit} onDelete={handleDeleteOpen} />
      </div>

      {selectedProduct && (
        <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onSave={handleSave} />
      )}

      <DeleteConfirmationModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} />
    </div>
  );
}