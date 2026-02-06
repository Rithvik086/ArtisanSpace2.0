import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../../lib/axios";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import Loader from "@/components/ui/Loader";

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
  userId: {
    _id: string;
    name: string;
  };
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Error fetching product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const response = await axiosInstance.post(
        `/cart?productId=${product._id}&quantity=${quantity}`
      );
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

  const formatTag = (text: string) => {
    if (!text) return "";
    return text
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <Loader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 text-amber-900">
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
        <p className="mb-6">{error || "Product not found"}</p>
        <Link
          to="/customer/store"
          className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  const discountPercentage =
    product.oldPrice > product.newPrice
      ? Math.round(
          ((product.oldPrice - product.newPrice) / product.oldPrice) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb / Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-amber-800 hover:text-amber-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Store
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-[400px] md:h-[600px] bg-gray-50 p-8 flex items-center justify-center">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-full object-contain drop-shadow-xl"
              />
              {discountPercentage > 0 && (
                <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                  -{discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-2 flex gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold tracking-wide uppercase">
                  {formatTag(product.category)}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold tracking-wide uppercase">
                  {formatTag(product.material)}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating Placeholder */}
              <div className="flex items-center mb-6">
                <div className="flex text-amber-400">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                  <Star className="w-5 h-5 text-gray-300 fill-current" />
                </div>
                <span className="ml-2 text-gray-600 text-sm">
                  (4.2 reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-amber-900">
                  ₹{product.newPrice}
                </span>
                {product.oldPrice > product.newPrice && (
                  <span className="ml-4 text-xl text-gray-400 line-through">
                    ₹{product.oldPrice}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 border-b border-gray-100 pb-8">
                <div className="flex items-center border border-gray-300 rounded-lg w-max">
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setQuantity(Math.min(product.quantity, quantity + 1))
                    }
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className={`flex-1 flex items-center justify-center px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:-translate-y-1 ${
                    product.quantity > 0
                      ? "bg-amber-800 text-white hover:bg-amber-900 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>

              {/* Features / Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-700" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-700" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
