"use client";

import { craftStyles, cn } from '../../styles/theme';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h2>
          <p className="text-sm text-gray-600 mb-6">
            This action cannot be undone. This will permanently delete the
            product from your store.
          </p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className={cn(craftStyles.heroButton.compact, 'px-4 py-2')}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={cn(craftStyles.heroButton.default, 'px-4 py-2')}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}