"use client";

import { useState, useEffect } from "react";
import { craftStyles, cn } from "../../styles/theme";
import { Loader2, Upload } from "lucide-react";

interface BulkItem {
  productName: string;
  type: string;
  material: string;
  image?: string;
  price: string | number;
  quantity: string | number;
  description: string;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: BulkItem[]) => Promise<unknown>;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onSubmit,
}: BulkUploadModalProps) {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setText("");
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    let items: unknown;
    try {
      items = JSON.parse(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError("Invalid JSON: " + msg);
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      setError("Please provide an array of products.");
      return;
    }
    // we trust caller to validate further

    setLoading(true);
    try {
      // cast to BulkItem[] since we've checked it's an array
      await onSubmit(items as BulkItem[]);
      setSuccess("Bulk upload completed.");
      // optionally display results/res
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Bulk creation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden w-full max-w-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-100 to-orange-100 px-8 py-6 border-b border-amber-200">
          <div className="flex items-center">
            <Upload className="w-6 h-6 text-amber-800 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-amber-900 font-baloo">
                Bulk Upload Products
              </h2>
              <p className="text-amber-700 mt-1">
                Import multiple products at once
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Instructions */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-amber-900 uppercase tracking-wide">
              JSON Format
            </label>
            <p className="text-sm text-amber-700 leading-relaxed">
              Paste a JSON array of products. Each item must include:
              <br />
              <code className="bg-amber-50 px-2 py-1 rounded inline-block mt-2 font-mono text-xs">
                productName, type, material, price, quantity, description
              </code>
              <br />
              Optionally include an{" "}
              <code className="bg-amber-50 px-2 py-1 rounded inline-block mt-1 font-mono text-xs">
                image
              </code>{" "}
              URL.
            </p>
          </div>

          {/* JSON Input */}
          <div className="space-y-3">
            <label
              htmlFor="bulk-json"
              className="block text-sm font-semibold text-amber-900 uppercase tracking-wide"
            >
              Products JSON
            </label>
            <textarea
              id="bulk-json"
              className={cn(
                craftStyles.input.default,
                "text-sm font-mono resize-none h-40",
              )}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='{\n  "productName": "Hand-carved Bowl",\n  "type": "pottery",\n  "material": "wood",\n  "price": 25,\n  "quantity": 10,\n  "description": "A beautiful wooden bowl"\n}'
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 rounded-xl text-center font-medium bg-red-100 text-red-800 border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 rounded-xl text-center font-medium bg-green-100 text-green-800 border border-green-200">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className={cn(craftStyles.button.secondary, "px-6 py-3")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                craftStyles.button.primary,
                "px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="inline mr-2 h-5 w-5" />
                  Upload Products
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
