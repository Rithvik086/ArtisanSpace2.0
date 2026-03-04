"use client";

import { Trash2, Camera } from "lucide-react";
import { craftStyles, cn } from "../styles/theme";

export interface ProductCardProps {
  _id: string;
  name: string;
  image: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  category: string;
  status: "active" | "pending" | "inactive" | "rejected";
  rejectionReason?: string;
  uploadedBy?: string;
  onUpdateImage: (
    productId: string,
    productName: string,
    currentImage: string,
  ) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({
  _id,
  name,
  image,
  oldPrice,
  newPrice,
  quantity,
  category,
  status,
  rejectionReason,
  uploadedBy,
  onUpdateImage,
  onDelete,
}: ProductCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    inactive: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-amber-100 overflow-hidden group">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
        {/* Overlay buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onUpdateImage(_id, name, image)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition"
            title="Update image"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
            title="Delete product"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              statusColors[status],
            )}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-amber-900 truncate">{name}</h3>

        {/* Uploader info (displayed in manager view) */}
        {uploadedBy && (
          <p className="text-xs text-stone-500">Added by: {uploadedBy}</p>
        )}

        {/* Category */}
        {category && (
          <p className="text-xs text-stone-500 capitalize">{category}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 line-through">
            ₹{oldPrice.toFixed(2)}
          </span>
          <span className="font-bold text-green-600">
            ₹{newPrice.toFixed(2)}
          </span>
        </div>

        {/* Quantity */}
        <div className="text-sm text-amber-700">
          Stock: <span className="font-semibold">{quantity}</span>
        </div>

        {/* Rejection Reason (if status is rejected) */}
        {status === "rejected" && rejectionReason && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <p className="text-xs font-semibold text-red-700 mb-1">
              Rejection Reason:
            </p>
            <p className="text-red-600 text-xs">{rejectionReason}</p>
          </div>
        )}

        {/* Mobile action buttons */}
        <div className="hidden sm:flex gap-2 pt-2 md:hidden">
          <button
            onClick={() => onUpdateImage(_id, name, image)}
            className={cn(craftStyles.button.secondary, "flex-1 text-sm py-1")}
          >
            Update Image
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
