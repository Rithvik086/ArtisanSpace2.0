import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function UsersTab({ setModalState }: { setModalState: React.Dispatch<React.SetStateAction<any>> }) {
  const { state } = useAppContext();
  const users = state.users;

  const openAddUserModal = (): void => setModalState({ type: 'add-user', isOpen: true, data: null });
  const openDeleteModal = (id: string): void => setModalState({ type: 'delete-user', isOpen: true, data: { id } });

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Manage Users</h3>
        <button onClick={openAddUserModal} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md">
          <PlusCircle size={18} /> <span>Add New User</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-red-100 text-red-800' : user.role === 'Artisan' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openDeleteModal(user.id)} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                    <Trash2 size={16} /> <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
