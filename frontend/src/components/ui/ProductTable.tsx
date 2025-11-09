"use client";

import { Pencil, Trash2, Eye, Star } from "lucide-react";
import { cn } from "../../styles/theme";

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

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Eye className="w-12 h-12 text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold text-amber-900 mb-2">No creations yet</h3>
        <p className="text-amber-700">Start crafting your first listing to showcase your talents!</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-amber-200 bg-linear-to-r from-amber-50 to-orange-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Creation</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100">
              {products.map((product, index) => (
                <tr key={product._id} className={cn(
                  "hover:bg-linear-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200",
                  index % 2 === 0 ? "bg-white" : "bg-amber-25"
                )}>
                  <td className="px-6 py-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-amber-200 shadow-md"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-amber-900 font-serif">{product.name}</h4>
                        <p className="text-sm text-amber-700 mt-1 line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <p className="text-sm text-amber-700">
                        <span className="font-medium">Original:</span> ₹{product.oldPrice.toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-amber-900">₹{product.newPrice.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-lg font-semibold text-amber-900">{product.quantity}</span>
                      <span className="text-sm text-amber-700 ml-1">available</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border",
                      getStatusColor(product.status)
                    )}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => onEdit(product)}
                        className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors duration-200 border border-amber-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(product._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 border border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-amber-200"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-amber-900 font-serif truncate">{product.name}</h3>
                  <p className="text-sm text-amber-700 mt-1">{product.category}</p>
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2",
                    getStatusColor(product.status)
                  )}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Price</p>
                  <p className="text-lg font-bold text-amber-900">₹{product.newPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Stock</p>
                  <p className="text-lg font-semibold text-amber-900">{product.quantity}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => onEdit(product)}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors duration-200 border border-amber-300 flex items-center space-x-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => onDelete(product._id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 border border-red-300 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Product };