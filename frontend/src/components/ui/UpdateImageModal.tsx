"use client";

import { useState, useRef } from "react";
import { craftStyles, cn } from "../../styles/theme";
import { X, Image as ImageIcon, AlertCircle, Upload } from "lucide-react";
import api from "../../lib/axios";

interface UpdateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  currentImageUrl: string;
  productId: string;
  onSuccess: (newImageUrl: string) => void;
}

export function UpdateImageModal({
  isOpen,
  onClose,
  productName,
  currentImageUrl,
  productId,
  onSuccess,
}: UpdateImageModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported image format. Accepted: JPG, PNG, WEBP.");
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageFile) {
      setError("Please select an image file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await api.patch(
        `/products/${productId}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = response.data;
      onSuccess(data.imageUrl);
      setImageFile(null);
      setPreview(currentImageUrl);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          (err as Error).message ||
          "Failed to update image",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-linear-to-r from-amber-400 via-orange-300 to-pink-300 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-6 h-6 text-amber-900" />
            <h2 className="text-xl font-bold text-amber-900">
              Update Product Image
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-amber-900 hover:bg-amber-200 rounded-full p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name Display */}
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-2">
              Product
            </label>
            <p className="text-amber-800 bg-amber-50 p-3 rounded border border-amber-200">
              {productName}
            </p>
          </div>

          {/* Current Image Preview */}
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-2">
              Current Image
            </label>
            <img
              src={currentImageUrl}
              alt={productName}
              className="w-full h-40 object-cover rounded border border-amber-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x300?text=Image+Not+Found";
              }}
            />
          </div>

          {/* File Input */}
          <div>
            <label
              htmlFor="imageFile"
              className="block text-sm font-semibold text-amber-900 mb-2"
            >
              Upload New Image
            </label>
            <input
              ref={fileInputRef}
              id="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-900 font-semibold transition"
            >
              <Upload className="w-5 h-5" />
              Choose Image (JPG, PNG, WEBP)
            </button>
            {imageFile && (
              <p className="text-sm text-amber-700 mt-2">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          {/* Image Preview */}
          {imageFile && (
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Preview
              </label>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover rounded border border-amber-200"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded p-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(craftStyles.button.secondary, "flex-1")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !imageFile}
              className={cn(
                craftStyles.button.primary,
                "flex-1",
                (loading || !imageFile) && "opacity-50 cursor-not-allowed",
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </span>
              ) : (
                "Upload Image"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
