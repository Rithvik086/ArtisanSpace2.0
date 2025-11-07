import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '../../styles/theme';
import { useAppContext } from '../AppContext';
import type { Product } from '../AppContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps): React.ReactElement | null {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className={cn('shadow-2xl w-full max-w-lg border-2 border-amber-300', 'bg-white rounded-md')}>
        <div className="flex justify-between items-center p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <h2 className="text-2xl font-bold text-amber-900 font-serif">{title}</h2>
          <button onClick={onClose} className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-2 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function AddUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): React.ReactElement {
  const { dispatch } = useAppContext();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newUser = {
      id: '',
      username: String(form.get('username') || ''),
      email: String(form.get('email') || ''),
      role: String(form.get('role') || 'customer'),
      name: String(form.get('name') || ''),
      mobile_no: String(form.get('mobile_no') || ''),
      pass: String(form.get('pass') || ''),
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-amber-900 mb-2">Username</label>
          <input name="username" required className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-amber-900 mb-2">Name</label>
          <input name="name" required className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-amber-900 mb-2">Email</label>
          <input name="email" type="email" required className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-amber-200">
          <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 rounded-md">Cancel</button>
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-md">Add User</button>
        </div>
      </form>
    </Modal>
  );
}

export function AddProductModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): React.ReactElement {
  const { dispatch } = useAppContext();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: '',
      name: String(f.get('name') || ''),
      category: String(f.get('category') || ''),
      newPrice: Number(f.get('price') || 0),
      oldPrice: Number(f.get('price') || 0) * 1.2,
      quantity: Number(f.get('stock') || 0),
      image: String(f.get('image') || ''),
      description: String(f.get('description') || ''),
      visible: String(f.get('visible')) === 'true',
      uploadedBy: 'current_admin',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input name="name" required className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select name="category" className="w-full px-3 py-2 border rounded-md">
            <option>Pottery</option>
            <option>Woodcraft</option>
            <option>Textiles</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Price (₹)</label>
          <input name="price" type="number" step="0.01" required className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Add Product</button>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteModal({ isOpen, onClose, onConfirm, itemType }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemType: string; }): React.ReactElement {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete ${itemType}`}>
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-gray-700">Are you sure you want to delete this {itemType}? This action cannot be undone.</p>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">Yes, Delete</button>
        </div>
      </div>
    </Modal>
  );
}
