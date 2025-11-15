import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import StoreCard from "@/components/customer/StoreCard";
import api from "@/lib/axios";

interface Product {
  _id: string;
  name: string;
  category: string;
  material: string;
  image: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  description: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  // Available filter options
  const categories = [
    "Jewelry",
    "Home Decor",
    "Clothing",
    "Art",
    "Accessories",
  ];
  const materials = ["Wood", "Metal", "Ceramic", "Fabric", "Leather", "Glass"];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategories, selectedMaterials]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const categoryParam =
        selectedCategories.length > 0
          ? selectedCategories.join(",")
          : undefined;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      });

      if (categoryParam) {
        params.append("category", categoryParam);
      }

      const response = await api.get(`/products/approved?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post("/cart", { productId, quantity: 1 });
      // Show success notification (you can implement this)
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchTerm);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <CustomerHeader />
      <main className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="relative flex flex-col items-center w-full max-w-md mx-auto my-7.5">
            <form onSubmit={handleSearch} className="w-full">
              <input
                type="text"
                id="searchInput"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </form>
          </div>

          <div className="flex gap-8">
            {/* Left Sidebar - Filters */}
            <aside className="w-64 bg-amber-50 p-6 rounded-lg shadow-sm h-fit sticky top-24">
              <h3 className="text-xl font-bold text-amber-900 mb-6 text-center">
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6 p-2.5 bg-white/70 rounded-lg">
                <h4 className="text-lg font-semibold text-amber-900 mb-3 border-b-2 border-amber-900 pb-2">
                  Category
                </h4>
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center cursor-pointer p-1.5 rounded transition-colors hover:bg-amber-100/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="mr-2.5 accent-amber-800"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>

              {/* Material Filter */}
              <div className="p-2.5 bg-white/70 rounded-lg">
                <h4 className="text-lg font-semibold text-amber-900 mb-3 border-b-2 border-amber-900 pb-2">
                  Material
                </h4>
                {materials.map((material) => (
                  <label
                    key={material}
                    className="flex items-center cursor-pointer p-1.5 rounded transition-colors hover:bg-amber-100/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material)}
                      onChange={() => handleMaterialChange(material)}
                      className="mr-2.5 accent-amber-800"
                    />
                    <span className="text-sm">{material}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedMaterials([]);
                  setCurrentPage(1);
                }}
                className="w-full mt-6 bg-amber-800 text-white py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors"
              >
                Clear Filters
              </button>
            </aside>

            {/* Right Side - Products */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600">
                      Showing {filteredProducts.length} of{" "}
                      {pagination.totalProducts} products
                    </p>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-xl text-gray-600 mb-4">
                        No products found
                      </p>
                      <p className="text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                    <>
                      <ul className="list-none flex justify-center flex-wrap gap-15 p-0">
                        {filteredProducts.map((product) => (
                          <StoreCard
                            key={product._id}
                            product={product}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                      </ul>

                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-12">
                          {Array.from(
                            { length: pagination.totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Link
                              key={page}
                              to="#"
                              className={`font-bold mx-1 px-3 py-2 rounded ${
                                page === currentPage
                                  ? "bg-amber-800 text-white"
                                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                            >
                              {page}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <CustomerFooter />
    </>
  );
};

export default Store;
