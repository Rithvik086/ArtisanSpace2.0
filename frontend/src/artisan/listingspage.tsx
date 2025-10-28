"use client";

import { ProductForm } from "../components/forms/ProductForm";
import { useNavigate } from "react-router-dom";

interface ResponseData {
  message?: string;
  [key: string]: any;
}

export default function AddListingPage(): React.ReactElement {
  const navigate = useNavigate();

  // Define the submission logic for an artisan
  // Backend endpoint: POST /api/v1/products (requires JWT auth cookie)
  const handleArtisanSubmit = async (formData: FormData): Promise<ResponseData> => {
    const response = await fetch("/api/v1/products", {
      method: "POST",
      body: formData,
      credentials: "include", // Send JWT token cookie for authentication
    });

    if (!response.ok) {
      const errorData: ResponseData = await response.json();
      throw new Error(errorData.message || "Failed to add product.");
    }

    return response.json();
  };

  // Define the success callback (redirect)
  const handleSuccess = (): void => {
    navigate("/artisan"); // Navigate back to artisan dashboard
  };

  return (
    <ProductForm
      onSubmit={handleArtisanSubmit}
      onSuccess={handleSuccess}
      submitButtonText="Craft My Listing"
      successMessage="Your creation has been listed! Redirecting to dashboard..."
    />
  );
}