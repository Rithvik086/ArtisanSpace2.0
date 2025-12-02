"use client";

import { useState, useEffect } from "react";
import { craftStyles, cn } from "../../styles/theme";

interface Product {
  _id: string;
  category: string;
  image: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  status: "active" | "pending" | "inactive" | "rejected";
  description: string;
}

interface FormData {
  name: string;
  oldPrice: string;
  newPrice: string;
  quantity: string;
  description: string;
}

interface FormErrors {
  name?: string;
  oldPrice?: string;
  newPrice?: string;
  quantity?: string;
  description?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

// Validation functions - align with ProductForm rules
const validateName = (name: string): boolean =>
  /^[a-zA-Z\s&-]{3,40}$/.test(name);
const validatePrice = (price: string): boolean =>
  /^\d{1,5}(\.\d{1,2})?$/.test(price) && parseFloat(price) > 0;
const validateQuantity = (qty: string): boolean =>
  /^[1-9][0-9]{0,3}$/.test(qty) &&
  parseInt(qty, 10) > 0 &&
  parseInt(qty, 10) <= 1000;
const validateDescription = (desc: string): boolean =>
  desc.length >= 10 && desc.length <= 500;

export function EditProductModal({
  isOpen,
  onClose,
  product,
  onSave,
}: EditProductModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    oldPrice: "",
    newPrice: "",
    quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        oldPrice: product.oldPrice.toString(),
        newPrice: product.newPrice.toString(),
        quantity: product.quantity.toString(),
        description: product.description,
      });
      setErrors({}); // Clear errors when modal opens
    }
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Live-validate this field
    let err = "";
    if (name === "name") {
      if (!validateName(value))
        err = "Name must be 3-40 letters, spaces, & or hyphens.";
    } else if (name === "oldPrice") {
      if (!validatePrice(value))
        err = "Original price must be >0 and up to 5 digits.";
    } else if (name === "newPrice") {
      if (!validatePrice(value))
        err = "Website price must be >0 and up to 5 digits.";
      else if (
        validatePrice(formData.oldPrice) &&
        parseFloat(value) > parseFloat(formData.oldPrice || "0")
      ) {
        err = "Website Price must be less than Original Price.";
      }
    } else if (name === "quantity") {
      if (/[+-]/.test(value))
        err = "Quantity must not contain '+' or '-' signs.";
      else if (!validateQuantity(value)) err = "Quantity must be 1-1000.";
    } else if (name === "description") {
      if (!validateDescription(value))
        err = "Description must be 10-500 characters.";
    }
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "+" || e.key === "-") {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        quantity: "Quantity must not contain '+' or '-' signs.",
      }));
    }
  };

  const handleQuantityPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (/[+-]/.test(text)) {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        quantity: "Pasted text may not contain '+' or '-' signs.",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const oldPriceNum = parseFloat(formData.oldPrice);
    const newPriceNum = parseFloat(formData.newPrice);

    if (!validateName(formData.name))
      newErrors.name = "Name must be 3-40 letters, spaces, & or hyphens.";
    if (!validatePrice(formData.oldPrice))
      newErrors.oldPrice = "Original Price must be >0 and up to 5 digits.";
    if (!validatePrice(formData.newPrice))
      newErrors.newPrice = "Website Price must be >0 and up to 5 digits.";
    if (
      validatePrice(formData.oldPrice) &&
      validatePrice(formData.newPrice) &&
      newPriceNum > oldPriceNum
    ) {
      newErrors.newPrice = "Website Price must be less than Original Price.";
    }
    if (!validateQuantity(formData.quantity))
      newErrors.quantity = "Quantity must be an integer between 1 and 1000.";
    if (!validateDescription(formData.description))
      newErrors.description = "Description must be 10-500 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Keep overall validity updated when formData or errors change
  useEffect(() => {
    const hasErrors = Object.values(errors).some((v) => v && v.length > 0);
    const allFilled =
      formData.name &&
      formData.oldPrice &&
      formData.newPrice &&
      formData.quantity &&
      formData.description;
    setIsFormValid(!hasErrors && Boolean(allFilled));
  }, [errors, formData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm() && product) {
      onSave({
        ...product,
        ...formData,
        oldPrice: parseFloat(formData.oldPrice),
        newPrice: parseFloat(formData.newPrice),
        quantity: parseInt(formData.quantity, 10),
      });
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Product: {product.name}
          </h2>
          <button
            onClick={onClose}
            className={cn(craftStyles.heroButton.compact, "p-2")}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.name && (
                <p className="col-span-4 text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="oldPrice"
                className="text-right text-sm font-medium"
              >
                Original Price
              </label>
              <input
                id="oldPrice"
                name="oldPrice"
                value={formData.oldPrice}
                onChange={handleChange}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.oldPrice && (
                <p className="col-span-4 text-red-500 text-sm">
                  {errors.oldPrice}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="newPrice"
                className="text-right text-sm font-medium"
              >
                Website Price
              </label>
              <input
                id="newPrice"
                name="newPrice"
                value={formData.newPrice}
                onChange={handleChange}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.newPrice && (
                <p className="col-span-4 text-red-500 text-sm">
                  {errors.newPrice}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="quantity"
                className="text-right text-sm font-medium"
              >
                Stock
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                onKeyDown={handleQuantityKeyDown}
                onPaste={handleQuantityPaste}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.quantity && (
                <p className="col-span-4 text-red-500 text-sm">
                  {errors.quantity}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="description"
                className="text-right text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.description && (
                <p className="col-span-4 text-red-500 text-sm">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={cn(craftStyles.heroButton.compact, "px-4 py-2")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cn(craftStyles.heroButton.default, "px-4 py-2")}
                disabled={!isFormValid}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export type { Product };
