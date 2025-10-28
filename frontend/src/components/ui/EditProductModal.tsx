"use client";

import { useState, useEffect } from "react";

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

// Validation functions
const validateName = (name: string): boolean => /^[a-zA-Z0-9\s-]{3,30}$/.test(name);
const validatePrice = (price: string): boolean => /^\d+(\.\d{1,2})?$/.test(price);
const validateQuantity = (qty: string): boolean => /^[1-9]\d*$/.test(qty);
const validateDescription = (desc: string): boolean => desc.length >= 10 && desc.length <= 500;

export function EditProductModal({ isOpen, onClose, product, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    oldPrice: "",
    newPrice: "",
    quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const oldPriceNum = parseFloat(formData.oldPrice);
    const newPriceNum = parseFloat(formData.newPrice);

    if (!validateName(formData.name)) newErrors.name = "Name must be 3-30 letters, numbers, spaces, or hyphens.";
    if (!validatePrice(formData.oldPrice)) newErrors.oldPrice = "Original Price must be a valid number.";
    if (!validatePrice(formData.newPrice)) newErrors.newPrice = "Website Price must be a valid number.";
    if (validatePrice(formData.oldPrice) && validatePrice(formData.newPrice) && newPriceNum > oldPriceNum) {
      newErrors.newPrice = "Website Price must be less than Original Price.";
    }
    if (!validateQuantity(formData.quantity)) newErrors.quantity = "Stock must be a positive integer.";
    if (!validateDescription(formData.description)) newErrors.description = "Description must be 10-500 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Product: {product.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
              <input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md" 
              />
              {errors.name && <p className="col-span-4 text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="oldPrice" className="text-right text-sm font-medium">Original Price</label>
              <input 
                id="oldPrice" 
                name="oldPrice" 
                value={formData.oldPrice} 
                onChange={handleChange} 
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md" 
              />
              {errors.oldPrice && <p className="col-span-4 text-red-500 text-sm">{errors.oldPrice}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newPrice" className="text-right text-sm font-medium">Website Price</label>
              <input 
                id="newPrice" 
                name="newPrice" 
                value={formData.newPrice} 
                onChange={handleChange} 
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md" 
              />
              {errors.newPrice && <p className="col-span-4 text-red-500 text-sm">{errors.newPrice}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="quantity" className="text-right text-sm font-medium">Stock</label>
              <input 
                id="quantity" 
                name="quantity" 
                type="number" 
                value={formData.quantity} 
                onChange={handleChange} 
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md" 
              />
              {errors.quantity && <p className="col-span-4 text-red-500 text-sm">{errors.quantity}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">Description</label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md" 
              />
              {errors.description && <p className="col-span-4 text-red-500 text-sm">{errors.description}</p>}
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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