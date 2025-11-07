import React from 'react';
import { useAppContext } from '../AppContext';

interface Product {
  id: string;
  image: string;
  name: string;
  uploadedBy: string;
  quantity: number;
  oldPrice: number;
  newPrice: number;
  category: string;
  status: 'approved' | 'pending' | 'disapproved';
}

export default function ModerationProductCard({ product }: { product: Product }): React.ReactElement {
  const { dispatch } = useAppContext();

  const handleApprove = (): void => dispatch({ type: 'APPROVE_PRODUCT', payload: product.id });
  const handleDisapprove = (): void => dispatch({ type: 'DISAPPROVE_PRODUCT', payload: product.id });

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex gap-4">
          <img className="h-20 w-20 rounded-md object-cover flex-shrink-0" src={product.image} alt={product.name} />
          <div className="flex-grow">
            <h4 className="text-md font-semibold text-gray-900">{product.name}</h4>
            <p className="text-sm text-gray-500">by {product.uploadedBy}</p>
            <p className="text-sm text-gray-500">{product.category}</p>
            <div className="mt-1">
              <span className="text-lg font-bold text-gray-900">₹{product.newPrice.toFixed(2)}</span>
              <s className="text-sm text-gray-400 ml-2">₹{product.oldPrice.toFixed(2)}</s>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3">
        {product.status !== 'approved' && (
          <button onClick={handleApprove} className="px-3 py-1 bg-green-500 text-white rounded-md">Approve</button>
        )}
        {product.status !== 'disapproved' && (
          <button onClick={handleDisapprove} className="px-3 py-1 bg-red-500 text-white rounded-md">Disapprove</button>
        )}
      </div>
    </div>
  );
}
