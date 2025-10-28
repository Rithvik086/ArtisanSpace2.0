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

// Mock data to simulate fetching
const mockProducts: Product[] = [
  {
    _id: "60d5f1b4e6b3c1a2b8d0c8f7",
    category: "Pottery",
    image: "https://via.placeholder.com/60",
    name: "Ceramic Vase",
    oldPrice: 1200,
    newPrice: 999,
    quantity: 25,
    status: "active",
    description: "Handcrafted ceramic vase, perfect for home decor. Made with high-quality clay and a smooth glaze finish."
  },
  {
    _id: "60d5f1b4e6b3c1a2b8d0c8f8",
    category: "Textiles",
    image: "https://via.placeholder.com/60",
    name: "Handwoven Scarf",
    oldPrice: 800,
    newPrice: 650,
    quantity: 40,
    status: "active",
    description: "A beautiful handwoven scarf made from 100% pure cotton. Soft, lightweight, and stylish."
  },
  {
    _id: "60d5f1b4e6b3c1a2b8d0c8f9",
    category: "Woodwork",
    image: "https://via.placeholder.com/60",
    name: "Wooden Bowl",
    oldPrice: 500,
    newPrice: 500,
    quantity: 15,
    status: "pending",
    description: "A hand-carved wooden bowl, ideal for salads or as a decorative piece. Finished with food-safe oil."
  },
];

export default function ArtisanDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

  // Simulate fetching products on mount
  useEffect(() => {
    // In a real app, you'd fetch this from an API
    // fetch('/api/artisan/products')
    //   .then(res => res.json())
    //   .then(data => setProducts(data));
    setProducts(mockProducts);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Craft-inspired Header */}
      <header className={cn(craftStyles.layout.header, "py-6")}>
        <div className={craftStyles.layout.container}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 font-serif">
                <Palette className="inline-block w-8 h-8 mr-3 text-amber-600" />
                Artisan Workshop
              </h1>
              <p className="text-amber-700 mt-2 text-lg">Where creativity meets commerce</p>
            </div>
            <Link 
              to="/artisan/add-listing"
              className={cn(craftStyles.button.primary, "flex items-center gap-2")}
            >
              <Plus className="w-5 h-5" />
              Add New Creation
            </Link>
          </div>
        </div>
      </header>

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