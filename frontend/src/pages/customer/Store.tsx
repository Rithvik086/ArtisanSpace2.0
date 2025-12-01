import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SlidersHorizontal, Check } from "lucide-react";
import StoreCard from "@/components/customer/StoreCard";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/ToastProvider";
import { useLoading } from "@/components/ui/LoadingProvider";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();

  // Available filter options
  const categories = [
    "Jewelry",
    "Statue",
    "Home Decor",
    "Clothing",
    "Art",
    "Accessories",
  ];
  const materials = [
    "Wood",
    "Brass",
    "Clay",
    "Ceramic",
    "Fabric",
    "Leather",
    "Glass",
  ];

  const fetchProducts = useCallback(async () => {
    try {
      showLoading();
      const categoryParam =
        selectedCategories.length > 0
          ? selectedCategories
              .map((c) => c.toLowerCase().replace(/\s+/g, "_"))
              .join(",")
          : undefined;

      const materialParam =
        selectedMaterials.length > 0
          ? selectedMaterials
              .map((m) => m.toLowerCase().replace(/\s+/g, "_"))
              .join(",")
          : undefined;

      // In a real app, you'd pass these to the backend
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      });

      if (categoryParam) {
        params.append("category", categoryParam);
      }

      if (materialParam) {
        params.append("material", materialParam);
      }

      const response = await api.get(`/products/approved?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      hideLoading();
    }
  }, [
    currentPage,
    selectedCategories,
    selectedMaterials,
    showLoading,
    hideLoading,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, selectedMaterials]);

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await api.post(`/cart`, { productId });
      if (response.data.success) {
        showToast("Product added to cart!", "success");
      } else {
        showToast(response.data.message || "Failed to add to cart", "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add to cart", "error");
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
    // In a real app, this would trigger a backend search
  };

  const normalizeString = (str: string) =>
    str.toLowerCase().replace(/\s+/g, "_");

  const filteredProducts = products.filter(
    (product) =>
      normalizeString(product.name).includes(normalizeString(searchTerm)) ||
      normalizeString(product.category).includes(normalizeString(searchTerm)) ||
      normalizeString(product.material).includes(normalizeString(searchTerm))
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-stone-100 font-baloo text-stone-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-baloo font-bold text-amber-900 mb-6 tracking-tight"
          >
            Curated Artisan Treasures
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-stone-600 max-w-2xl mx-auto mb-10 font-light"
          >
            Discover unique, handcrafted pieces that tell a story. Directly from
            the hands of master artisans to your home.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search for jewelry, pottery, woodwork..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-stone-200 rounded-full text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-lg hover:shadow-xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-amber-900 text-white px-6 rounded-full font-medium hover:bg-amber-800 transition-colors"
              >
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-stone-200 p-3 rounded-lg shadow-sm text-stone-700 font-medium"
            >
              <Filter className="h-5 w-5" />
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 shrink-0 ${
              showMobileFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-24 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-baloo font-bold text-amber-900 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </h3>
                  {(selectedCategories.length > 0 ||
                    selectedMaterials.length > 0) && (
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedMaterials([]);
                        setCurrentPage(1);
                      }}
                      className="text-xs text-amber-600 hover:text-amber-800 font-medium underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                    Category
                  </h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center group cursor-pointer"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-stone-300 transition-all checked:border-amber-600 checked:bg-amber-600 hover:border-amber-500"
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                          />
                          <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="ml-3 text-stone-600 group-hover:text-amber-800 transition-colors">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                    Material
                  </h4>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <label
                        key={material}
                        className="flex items-center group cursor-pointer"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-stone-300 transition-all checked:border-amber-600 checked:bg-amber-600 hover:border-amber-500"
                            checked={selectedMaterials.includes(material)}
                            onChange={() => handleMaterialChange(material)}
                          />
                          <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="ml-3 text-stone-600 group-hover:text-amber-800 transition-colors">
                          {material}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              {/* <div className="bg-amber-900 text-amber-50 p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-baloo text-xl font-bold mb-2">
                    Join the Community
                  </h4>
                  <p className="text-amber-200 text-sm mb-4">
                    Get exclusive access to new artisan drops.
                  </p>
                  <button className="w-full bg-white text-amber-900 py-2 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors">
                    Sign Up
                  </button>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-800 rounded-full opacity-50"></div>
              </div> */}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
                <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-stone-400" />
                </div>
                <h3 className="text-2xl font-baloo font-bold text-stone-800 mb-2">
                  No products found
                </h3>
                <p className="text-stone-500 max-w-md mx-auto mb-8">
                  We couldn't find any matches for "{searchTerm}". Try adjusting
                  your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                    setSelectedMaterials([]);
                  }}
                  className="text-amber-700 font-medium hover:text-amber-900 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product._id}
                        variants={itemVariants}
                        layout
                      >
                        <StoreCard
                          product={product}
                          onAddToCart={handleAddToCart}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-16">
                    <nav className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                            page === currentPage
                              ? "bg-amber-900 text-white shadow-md"
                              : "text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Store;
