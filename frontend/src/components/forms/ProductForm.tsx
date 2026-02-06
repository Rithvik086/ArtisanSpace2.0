"use client";

import { useState, useRef, useEffect } from "react";
import { FileUp, Loader2, Sparkles } from "lucide-react";
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
// Name: letters, spaces, ampersand or hyphen only (no digits), 3-40 chars
const productNameregex = /^[a-zA-Z\s&-]{3,40}$/;
// Material: letters, spaces, commas, hyphens allowed. Require at least 1 char, max 50.
const materialregex = /^[a-zA-Z\s,\-]{1,50}$/;
// Price: up to 5 digits before decimal, optional 1-2 decimals (e.g. 99999 or 99999.99)
const originalPriceregex = /^\d{1,5}(\.\d{1,2})?$/;
const descriptionregex = /^.{10,500}$/; // Simplified to length, as regex was restrictive
// Quantity: integer > 0 (we'll additionally cap at 1000 in validation)
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
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.image || null
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "productName":
        return productNameregex.test(value)
          ? ""
          : "Name must be 3-40 letters, spaces, ampersand (&) or hyphens.";
      case "type":
        return value ? "" : "Please select a product type.";
      case "material":
        // required
        if (!value || value.trim().length === 0) {
          return "Please provide material(s) used.";
        }
        if (!materialregex.test(value)) {
          return "Material may contain letters, spaces, commas and hyphens (max 50 chars).";
        }
        // limit hyphens to 2
        const hyphenCount = (value.match(/-/g) || []).length;
        if (hyphenCount > 2) {
          return "Material can contain at most 2 hyphens.";
        }
        return "";
      case "price":
        // ensure numeric and within limits (>0 and up to 4 digits before decimal)
        if (!originalPriceregex.test(value)) {
          return "Price must be up to 5 digits (optionally with 1-2 decimals).";
        }
        try {
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            return "Price must be greater than 0.";
          }
        } catch (e) {
          return "Price must be a valid number.";
        }
        return "";
      case "description":
        return descriptionregex.test(value)
          ? ""
          : "Description must be between 10 and 500 characters.";
      case "quantity":
        // disallow plus/minus signs
        if (/[+-]/.test(value)) {
          return "Quantity must not contain '+' or '-' signs.";
        }
        if (!quantityregex.test(value)) {
          return "Quantity must be a positive integer.";
        }
        try {
          const q = parseInt(value, 10);
          if (isNaN(q) || q <= 0) return "Quantity must be greater than 0.";
          if (q > 1000) return "Quantity must be 1000 or less.";
        } catch (e) {
          return "Quantity must be a valid integer.";
        }
        return "";
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

  // Helper that returns errors object without mutating state (useful to compute validity)
  const getValidationErrors = (
    fd: ProductFormData,
    imgFile: File | null,
    imgPreview: string | null
  ): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    Object.keys(fd).forEach((key) => {
      const error = validateField(key, fd[key as keyof ProductFormData]);
      if (error) newErrors[key] = error;
    });
    // image
    if (!imgFile && !imgPreview) {
      newErrors.image = "A product photo is required.";
    }
    return newErrors;
  };

  const [isFormValid, setIsFormValid] = useState<boolean>(
    Object.keys(getValidationErrors(formData, imageFile, imagePreview)).length === 0
  );

  // Keep isFormValid updated as the user types or changes the image
  useEffect(() => {
    const errs = getValidationErrors(formData, imageFile, imagePreview);
    setIsFormValid(Object.keys(errs).length === 0);
  }, [formData, imageFile, imagePreview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    // Do not silently strip plus/minus for quantity; keep raw value and validate
    const newValue = name === "quantity" ? value : value.trimStart();
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    // Run live validation for this field
    const fieldError = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "+" || e.key === "-") {
      e.preventDefault();
      setErrors((prev) => ({ ...prev, quantity: "Quantity must not contain '+' or '-' signs." }));
    }
  };

  const handleQuantityPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (/[+-]/.test(text)) {
      e.preventDefault();
      setErrors((prev) => ({ ...prev, quantity: "Pasted text may not contain '+' or '-' signs." }));
    }
  };

  const handleSelectChange = (value: string): void => {
    setFormData((prev) => ({ ...prev, type: value }));
    // Validate the select immediately
    const fieldError = validateField("type", value);
    setErrors((prev) => ({ ...prev, type: fieldError }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate accepted formats
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Unsupported image format. Accepted: JPG, PNG, WEBP.",
        }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // clear image error
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const resetForm = (): void => {
    setFormData({
      productName: "",
      type: "",
      material: "",
      price: "",
      description: "",
      quantity: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setStatusMessage({ type: "", message: "" });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    // Append all text data, trimming whitespace
    Object.keys(formData).forEach((key) => {
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
    <div>
      <div className="max-w-4xl mx-auto px-4">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden">
          <div className="bg-linear-to-r from-amber-100 to-orange-100 px-8 py-6 border-b border-amber-200">
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-amber-800 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-amber-900 font-baloo">
                  Product Details
                </h2>
                <p className="text-amber-700 mt-1">
                  Tell us about your beautiful creation
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Name */}
              <div className="space-y-3">
                <label
                  htmlFor="product-name"
                  className="block text-sm font-semibold text-amber-900 uppercase tracking-wide"
                >
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
                  <label
                    htmlFor="product-type"
                    className="block text-sm font-semibold text-amber-900 uppercase tracking-wide"
                  >
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
                    <p className="text-sm text-red-600 font-medium">
                      {errors.type}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="material"
                    className="block text-sm font-semibold text-amber-900 uppercase tracking-wide"
                  >
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
                    <p className="text-sm text-red-600 font-medium">
                      {errors.material}
                    </p>
                  )}
                </div>
              </div>

              {/* Price and Quantity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="original-price"
                    className="block text-sm font-semibold text-amber-900 uppercase tracking-wide"
                  >
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
                    <p className="text-sm text-red-600 font-medium">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-semibold text-amber-900 uppercase tracking-wide"
                  >
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
                      onKeyDown={handleQuantityKeyDown}
                      onPaste={handleQuantityPaste}
                    className={cn(
                      craftStyles.input.default,
                      "text-lg",
                      errors.quantity ? craftStyles.input.error : ""
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600 font-medium">
                      {errors.quantity}
                    </p>
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
                    errors.image
                      ? "border-red-500 bg-red-50"
                      : "border-amber-300 bg-white"
                  )}
                >
                  <FileUp className="mr-3 h-6 w-6 text-amber-800" />
                  <span className="text-lg font-medium text-amber-900">
                    {imageFile
                      ? imageFile.name
                      : "Upload your creation's photo"}
                  </span>
                </button>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-stone-500">
                      Accepted formats: JPG, PNG, WEBP
                    </p>
                    {errors.image && (
                      <p className="text-sm text-red-600 font-medium">
                        {errors.image}
                      </p>
                    )}
                  </div>
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
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-amber-900 uppercase tracking-wide"
                >
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
                  <p className="text-sm text-red-600 font-medium">
                    {errors.description}
                  </p>
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
                disabled={isSubmitting || !isFormValid}
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
