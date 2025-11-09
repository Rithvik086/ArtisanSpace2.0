"use client";

import { useState, useRef } from "react";
import { FileUp, Loader2, Palette, Sparkles } from "lucide-react";
import { craftStyles, cn } from "../../styles/theme";

// TypeScript interfaces
interface ProductFormData {
  productName: string;
  type: string;
  material: string;
  price: string;
  description: string;
  quantity: string;
}

interface ProductType {
  value: string;
  label: string;
}

interface StatusMessage {
  type: "success" | "error" | "";
  message: string;
}

interface ProductFormProps {
  onSubmit: (formData: FormData) => Promise<any>;
  initialData?: Partial<ProductFormData & { image: string }>;
  submitButtonText?: string;
  successMessage?: string;
  onSuccess?: () => void;
}

interface ValidationErrors {
  [key: string]: string;
}

// Validation Regex from your original code
const productNameregex = /^[a-zA-Z0-9\s-&]{3,40}$/;
const materialregex = /^[a-zA-Z\s,-]{3,50}$/;
const originalPriceregex = /^\d+(\.\d{1,2})?$/;
const descriptionregex = /^.{10,500}$/; // Simplified to length, as regex was restrictive
const quantityregex = /^[1-9][0-9]*$/;

const productTypes: ProductType[] = [
  { value: "statue", label: "Statue" },
  { value: "painting", label: "Painting" },
  { value: "footware", label: "Footware" },
  { value: "headware", label: "Headware" }, // Corrected from original HTML
  { value: "pottery", label: "Pottery" },
  { value: "toys", label: "Toys" },
  { value: "other", label: "Other" },
];

/**
 * A reusable form for adding or editing a product.
 *
 * @param {object} props
 * @param {function(FormData): Promise<any>} props.onSubmit - Async function to handle form submission. Receives FormData.
 * @param {object} [props.initialData={}] - Pre-populates the form for editing.
 * @param {string} [props.submitButtonText="Add Product"] - Text for the submit button.
 * @param {string} [props.successMessage="Product added successfully!"] - Message on success.
 * @param {function} [props.onSuccess=()=>{}] - Callback function to run on successful submission (e.g., for redirection).
 */
export function ProductForm({
  onSubmit,
  initialData = {},
  submitButtonText = "Add Product",
  successMessage = "Product added successfully!",
  onSuccess = () => {},
}: ProductFormProps): React.ReactElement {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: initialData.productName || "",
    type: initialData.type || "",
    material: initialData.material || "",
    price: initialData.price || "",
    description: initialData.description || "",
    quantity: initialData.quantity || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image || null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "productName":
        return productNameregex.test(value)
          ? ""
          : "Name must be 3-40 letters, numbers, spaces, or hyphens.";
      case "type":
        return value ? "" : "Please select a product type.";
      case "material":
        return materialregex.test(value)
          ? ""
          : "Material must be 3-50 letters, spaces, commas, or hyphens.";
      case "price":
        return originalPriceregex.test(value)
          ? ""
          : "Price must be a valid number (e.g., 10.99).";
      case "description":
        return descriptionregex.test(value)
          ? ""
          : "Description must be between 10 and 500 characters.";
      case "quantity":
        return quantityregex.test(value)
          ? ""
          : "Quantity must be a positive number greater than 0.";
      case "image":
        return imageFile || imagePreview ? "" : "A product photo is required.";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof ProductFormData]);
      if (error) newErrors[key] = error;
    });
    
    // Validate image separately
    const imageError = validateField("image", "");
    if (imageError) newErrors.image = imageError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trimStart() }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (value: string): void => {
    setFormData((prev) => ({ ...prev, type: value }));
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const resetForm = (): void => {
    setFormData({
      productName: "", type: "", material: "", price: "", description: "", quantity: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setStatusMessage({ type: "", message: "" });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    // Append all text data, trimming whitespace
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key as keyof ProductFormData].trim());
    });
    
    // Only append image if a new one was selected
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await onSubmit(data); // Call the flexible submit function
      setStatusMessage({ type: "success", message: successMessage });
      resetForm();
      
      setTimeout(() => {
        onSuccess(); // Call the flexible success callback
      }, 2000);

    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: error.message || "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Palette className="w-8 h-8 text-amber-600 mr-3" />
            <h1 className="text-4xl font-bold text-amber-900 font-serif">Craft Your Listing</h1>
          </div>
          <p className="text-lg text-amber-700">Share your handmade treasures with the world</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-8 py-6 border-b border-amber-200">
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-amber-900 font-serif">Product Details</h2>
                <p className="text-amber-700 mt-1">Tell us about your beautiful creation</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Name */}
              <div className="space-y-3">
                <label htmlFor="product-name" className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                  Creation Name
                </label>
                <input
                  id="product-name"
                  name="productName"
                  type="text"
                  placeholder="What do you call this masterpiece?"
                  value={formData.productName}
                  onChange={handleChange}
                  className={cn(
                    craftStyles.input.default,
                    "text-lg font-medium",
                    errors.productName ? craftStyles.input.error : ""
                  )}
                />
                {errors.productName && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="font-medium">{errors.productName}</span>
                  </p>
                )}
              </div>

              {/* Type and Material Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="product-type" className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                    Craft Category
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    className={cn(
                      craftStyles.input.default,
                      "text-lg",
                      errors.type ? craftStyles.input.error : ""
                    )}
                  >
                    <option value="">Choose your craft type</option>
                    {productTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600 font-medium">{errors.type}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label htmlFor="material" className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                    Materials Used
                  </label>
                  <input
                    id="material"
                    name="material"
                    type="text"
                    placeholder="Clay, Cotton, Wood, etc."
                    value={formData.material}
                    onChange={handleChange}
                    className={cn(
                      craftStyles.input.default,
                      "text-lg",
                      errors.material ? craftStyles.input.error : ""
                    )}
                  />
                  {errors.material && (
                    <p className="text-sm text-red-600 font-medium">{errors.material}</p>
                  )}
                </div>
              </div>

              {/* Price and Quantity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="original-price" className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                    Price (₹)
                  </label>
                  <input
                    id="original-price"
                    name="price"
                    type="text"
                    placeholder="What's it worth?"
                    value={formData.price}
                    onChange={handleChange}
                    className={cn(
                      craftStyles.input.default,
                      "text-lg font-medium",
                      errors.price ? craftStyles.input.error : ""
                    )}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 font-medium">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label htmlFor="quantity" className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                    Available Quantity
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    placeholder="How many do you have?"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={cn(
                      craftStyles.input.default,
                      "text-lg",
                      errors.quantity ? craftStyles.input.error : ""
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600 font-medium">{errors.quantity}</p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                  Showcase Photo
                </label>
                <input
                  id="product-photo"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full px-6 py-4 border-2 border-dashed rounded-xl hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-center transition-all duration-200",
                    errors.image ? "border-red-500 bg-red-50" : "border-amber-300 bg-white"
                  )}
                >
                  <FileUp className="mr-3 h-6 w-6 text-amber-600" />
                  <span className="text-lg font-medium text-amber-900">
                    {imageFile ? imageFile.name : "Upload your creation's photo"}
                  </span>
                </button>
                {errors.image && (
                  <p className="text-sm text-red-600 font-medium">{errors.image}</p>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                    Preview
                  </label>
                  <div className="w-48 h-48 relative mx-auto border-4 border-amber-200 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-3">
                <label htmlFor="description" className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
                  Your Story
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Tell the story behind your creation. What inspired you? How was it made?"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={cn(
                    craftStyles.input.default,
                    "text-lg resize-none",
                    errors.description ? craftStyles.input.error : ""
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 font-medium">{errors.description}</p>
                )}
              </div>

              {/* Status Message */}
              {statusMessage.message && (
                <div
                  className={cn(
                    "p-4 rounded-xl text-center font-medium",
                    statusMessage.type === "success"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  )}
                >
                  {statusMessage.message}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={cn(
                  craftStyles.button.primary,
                  "w-full text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed",
                  "font-semibold tracking-wide"
                )}
              >
                {isSubmitting && (
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                )}
                {isSubmitting ? "Creating Your Listing..." : submitButtonText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}