import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function ProductsTab({ setModalState }: { setModalState: React.Dispatch<React.SetStateAction<any>> }) {
  const { state } = useAppContext();
  const products = state.products;

  const openAddProductModal = (): void => setModalState({ type: 'add-product', isOpen: true, data: null });
  const openDeleteModal = (id: string): void => setModalState({ type: 'delete-product', isOpen: true, data: { id } });

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Manage Products</h3>
        <button onClick={openAddProductModal} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md">
          <PlusCircle size={18} /> <span>Add New Product</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>UploadedBy</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><img className="h-10 w-10 rounded-md" src={product.image} alt={product.name} /></td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.uploadedBy}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-500"><s className="text-gray-400">₹{product.oldPrice.toFixed(2)}</s><br/><span className="text-gray-900 font-medium">₹{product.newPrice.toFixed(2)}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 text-sm font-medium"><button onClick={() => openDeleteModal(product.id)} className="text-red-600 flex items-center gap-1"><Trash2 size={16} />Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
