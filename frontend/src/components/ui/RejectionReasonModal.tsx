import React, { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
import api from "../../lib/axios";
import type { AxiosError } from "axios";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onSuccess?: (reason: string) => void;
}

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.patch(`/products/${productId}/rejection-reason`, {
        reason: reason.trim(),
      });
      onSuccess?.(reason.trim());
      setReason("");
      onClose();
    } catch (err) {
      console.error("Failed to update rejection reason", err);
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to save rejection reason",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-xl font-bold text-amber-900 font-baloo">
            Rejection Reason
          </h3>
        </div>

        <p className="text-amber-700 mb-4">
          Please provide a reason for rejecting <strong>{productName}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for rejection... (e.g., Image quality is poor, Price seems too high, etc.)"
          className="w-full border border-amber-200 rounded-lg p-3 mb-4 font-baloo text-amber-900 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={4}
          disabled={loading}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-amber-200 text-amber-900 rounded-lg font-semibold hover:bg-amber-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
