import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

export default function OrdersTab({ setModalState }: { setModalState: React.Dispatch<React.SetStateAction<any>> }) {
  const { state } = useAppContext();
  const orders = state.orders;
  const [filter, setFilter] = useState<string>('all');

  const openDeleteModal = (id: string): void => setModalState({ type: 'delete-order', isOpen: true, data: { id } });

  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => filter === 'all' || order.status.toLowerCase() === filter);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Manage Orders</h3>
        <div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded-md">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">#{String(order.id).toUpperCase().slice(-6)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.customer}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.date).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.items} item{order.items > 1 ? 's' : ''}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₹{order.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>{order.status}</span></td>
                <td className="px-6 py-4 text-sm font-medium flex gap-2"><button className="text-blue-600">View</button><button onClick={() => openDeleteModal(order.id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
