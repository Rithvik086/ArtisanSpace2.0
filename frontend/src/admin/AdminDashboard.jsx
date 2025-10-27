import React, { useState, useReducer, createContext, useContext, useEffect } from 'react';
// Removed Redux imports
import { Routes, Route, NavLink } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import {
  LayoutDashboard,
  ShieldCheck,
  LifeBuoy,
  Menu,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  PlusCircle,
  Trash2,
  DollarSign,
  Users2,
  PackageCheck,
  BarChart2,
  X,
  AlertCircle,
  Image as LucideImage,
  Star
} from 'lucide-react';
import { ClippedAreaChart } from '../components/ui/clipped-area-chart';

// Mock data removed — dashboard will fetch live data from backend endpoints.

// --- MOCK DATA ---

// Graph Data
const salesData = [
  { month: 'Jan', sales: 40000 },
  { month: 'Feb', sales: 30000 },
  { month: 'Mar', sales: 50000 },
  { month: 'Apr', sales: 45000 },
  { month: 'May', sales: 60000 },
  { month: 'Jun', sales: 70000 },
];
const ordersData = [
  { date: '01', orders: 20 }, { date: '05', orders: 25 }, { date: '10', orders: 22 },
  { date: '15', orders: 30 }, { date: '20', orders: 28 }, { date: '25', orders: 35 },
];
const productsData = [
  { date: '01', products: 120 }, { date: '05', products: 125 }, { date: '10', products: 122 },
  { date: '15', products: 130 }, { date: '20', products: 128 }, { date: '25', products: 135 },
];
const totalUsersData = [
  { date: '01', users: 500 }, { date: '05', users: 502 }, { date: '10', users: 508 },
  { date: '15', users: 510 }, { date: '20', users: 515 }, { date: '25', users: 520 },
];

// Initial State for Slices
const initialUsers = [
  { id: '1', username: 'alice_smith', email: 'alice@example.com', role: 'Admin' },
  { id: '2', username: 'bob_johnson', email: 'bob@example.com', role: 'Artisan' },
  { id: '3', username: 'charlie_lee', email: 'charlie@example.com', role: 'Customer' },
];

const initialProducts = [
  { id: 'p1', image: 'https://placehold.co/60x60/e2e8f0/64748b?text=Pot', name: 'Handmade Clay Pot', uploadedBy: 'bob_johnson', quantity: 15, oldPrice: 600, newPrice: 499, category: 'Pottery' },
  { id: 'p2', image: 'https://placehold.co/60x60/e2e8f0/64748b?text=Scarf', name: 'Woven Silk Scarf', uploadedBy: 'crafty_carol', quantity: 30, oldPrice: 1200, newPrice: 999, category: 'Textiles' },
  { id: 'p3', image: 'https://placehold.co/60x60/e2e8f0/64748b?text=Box', name: 'Carved Wooden Box', uploadedBy: 'bob_johnson', quantity: 5, oldPrice: 2500, newPrice: 2200, category: 'Woodcraft' },
];

const initialOrders = [
  { id: 'o1', customer: 'charlie_lee', date: '2023-10-25', items: 1, total: 499, status: 'Delivered' },
  { id: 'o2', customer: 'david_brown', date: '2023-10-26', items: 2, total: 3199, status: 'Processing' },
  { id: 'o3', customer: 'emma_white', date: '2023-10-27', items: 1, total: 999, status: 'Shipped' },
  { id: 'o4', customer: 'charlie_lee', date: '2023-10-28', items: 3, total: 5497, status: 'Pending' },
];

const initialFeedback = [
  { id: 'f1', fullName: 'Alice Smith', message: 'Absolutely love the pottery! Amazing quality and fast shipping. Will buy again.' },
  { id: 'f2', fullName: 'David Brown', message: 'The wooden box was beautiful, but it arrived with a small scratch. Customer service was helpful though.' },
  { id: 'f3', fullName: 'Charlie Lee', message: 'My new favorite scarf! The colors are even more vibrant in person. 10/10.' },
];

// --- REACT CONTEXT & REDUCER (Replaces Redux) ---

// 1. Initial State (start empty; we'll populate from backend)
const initialState = {
   users: initialUsers,
  products: initialProducts,
  orders: initialOrders,
  feedback: initialFeedback,
};

// 2. Reducer Function
function appReducer(state, action) {
  switch (action.type) {
    // User Actions
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, { id: crypto.randomUUID(), ...action.payload }],
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };
    // Product Actions
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, { id: crypto.randomUUID(), ...action.payload }],
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload),
      };
    // Order Actions
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter((order) => order.id !== action.payload),
      };
    // Set data from backend
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    default:
      return state;
  }
}

// 3. Create Context
const AppContext = createContext();

// 4. Custom Hook to use AppContext
const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- REMOVED REDUX SLICES AND STORE ---

// --- COMPONENTS ---

/**
 * Reusable Modal Component
 */
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Add User Modal
 */
function AddUserModal({ isOpen, onClose }) {
  const { dispatch } = useAppContext(); // Use context

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      username: formData.get('username'),
      email: formData.get('email'),
      role: formData.get('role'),
      // EJS had name, mobile, pass - adding them.
      name: formData.get('name'),
      mobile_no: formData.get('mobile_no'),
      pass: formData.get('pass'),
    };
    dispatch({ type: 'ADD_USER', payload: newUser }); // Dispatch plain action
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="username" name="username" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="mobile_no" className="block text-sm font-medium text-gray-700">Mobile No</label>
          <input type="text" id="mobile_no" name="mobile_no" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <select id="role" name="role" defaultValue="customer" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="artisan">Artisan</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="pass" name="pass" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-actions flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="cancel-btn px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button type="submit" className="submit-btn px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add User</button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Add Product Modal
 */
function AddProductModal({ isOpen, onClose }) {
  const { dispatch } = useAppContext(); // Use context

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProduct = {
      name: formData.get('name'),
      category: formData.get('category'),
      newPrice: parseFloat(formData.get('price')),
      oldPrice: parseFloat(formData.get('price')) * 1.2, // Mock old price
      quantity: parseInt(formData.get('stock'), 10),
      image: formData.get('image'),
      description: formData.get('description'),
      visible: formData.get('visible') === 'true',
      uploadedBy: 'current_admin', // Placeholder
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct }); // Dispatch plain action
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product">
      <form id="add-product-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" id="product-name" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="product-category" name="category" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="Pottery">Pottery</option>
            <option value="Woodcraft">Woodcraft</option>
            <option value="Textiles">Textiles</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Metalwork">Metalwork</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
          <input type="number" id="product-price" name="price" min="0" step="0.01" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700">Stock</label>
          <input type="number" id="product-stock" name="stock" min="0" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="product-image" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="text" id="product-image" name="image" defaultValue="https://placehold.co/60x60/e2e8f0/64748b?text=New" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="form-group">
          <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="product-description" name="description" rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="product-visible" className="block text-sm font-medium text-gray-700">Visibility</label>
          <select id="product-visible" name="visible" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </div>
        <div className="form-actions flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="cancel-btn px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button type="submit" className="submit-btn px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Product</button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Delete Confirmation Modal
 */
function DeleteModal({ isOpen, onClose, onConfirm, itemType }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete ${itemType}`}>
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-gray-700">Are you sure you want to delete this {itemType}? This action cannot be undone.</p>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={onClose} className="cancel-btn px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-confirm-btn px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}


/**
 * Header Component
 */
function Header() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-gray-100 text-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-blue-600">Admin</h1>
          </div>
          <div className="hidden md:flex md:ml-6">
            <nav className="flex space-x-4">
              <NavLink to="/" className={navLinkClass}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/moderation" className={navLinkClass}>
                <ShieldCheck size={18} />
                <span>Content Moderation</span>
              </NavLink>
              <NavLink to="/support" className={navLinkClass}>
                <LifeBuoy size={18} />
                <span>Support Ticket</span>
              </NavLink>
            </nav>
          </div>
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * GraphCard Component
 */
function GraphCard({ title, data, dataKey, xKey, icon, unit }) {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <IconComponent className="text-blue-500" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => (unit ? `${unit}${value/1000}k` : value)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', borderColor: '#e0e0e0' }}
              formatter={(value) => (unit ? `${unit}${value.toLocaleString()}` : value)}
            />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Tab: Users
 */
function UsersTab({ setModalState }) {
  const { state } = useAppContext(); // Use context
  const users = state.users;

  const openAddUserModal = () => setModalState({ type: 'add-user', isOpen: true, data: null });
  
  const openDeleteModal = (id) => setModalState({ type: 'delete-user', isOpen: true, data: { id } });
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Manage Users</h3>
        <button
          onClick={openAddUserModal}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150"
        >
          <PlusCircle size={18} />
          <span>Add New User</span>
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
                    user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'Artisan' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openDeleteModal(user.id)} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                    <Trash2 size={16} />
                    <span>Delete</span>
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

/**
 * Tab: Products
 */
function ProductsTab({ setModalState }) {
  const { state } = useAppContext(); // Use context
  const products = state.products;
  
  const openAddProductModal = () => setModalState({ type: 'add-product', isOpen: true, data: null });
  const openDeleteModal = (id) => setModalState({ type: 'delete-product', isOpen: true, data: { id } });

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Manage Products</h3>
         <button
          onClick={openAddProductModal}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150"
        >
          <PlusCircle size={18} />
          <span>Add New Product</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UploadedBy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} 
                       onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/f87171/ffffff?text=ERR'; }} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.uploadedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <s className="text-gray-400">₹{product.oldPrice.toFixed(2)}</s>
                  <br/>
                  <span className="text-gray-900 font-medium">₹{product.newPrice.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openDeleteModal(product.id)} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                    <Trash2 size={16} />
                    <span>Delete</span>
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

/**
 * Tab: Orders
 */
function OrdersTab({ setModalState }) {
  const { state } = useAppContext(); // Use context
  const orders = state.orders;
  const [filter, setFilter] = useState('all');
  
  const openDeleteModal = (id) => setModalState({ type: 'delete-order', isOpen: true, data: { id } });

  const getStatusClass = (status) => {
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
        <div className="filter-controls">
          <select 
            id="order-status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.toUpperCase().slice(-6)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items} item{order.items > 1 ? 's' : ''}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                  <button onClick={() => openDeleteModal(order.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Tab: Feedback
 */
function FeedbackTab() {
  const { state } = useAppContext(); // Use context
  const feedback = state.feedback;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Feedback</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedback.map((item) => (
          <div key={item.id} className="feedback-card bg-gray-50 rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="feedback-header flex items-center gap-4 mb-4">
              <div className="user-avatar w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                {item.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h4 className="text-md font-semibold text-gray-800">{item.fullName}</h4>
                <div className="flex text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill={item.id === 'f2' ? 'none' : 'currentColor'} stroke="currentColor" />
                </div>
              </div>
            </div>
            <p className="feedback-text text-gray-700 text-sm">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


/**
 * Main Dashboard Page Component
 */
function DashboardPage({ setModalState }) {
  const [activeTab, setActiveTab] = useState('Users');
  const { state } = useAppContext();

  const tabs = [
    { name: 'Users', icon: Users, content: <UsersTab setModalState={setModalState} /> },
    { name: 'Products', icon: Package, content: <ProductsTab setModalState={setModalState} /> },
    { name: 'Orders', icon: ShoppingCart, content: <OrdersTab setModalState={setModalState} /> },
    { name: 'Feedback', icon: MessageSquare, content: <FeedbackTab /> },
  ];

  return (
    <div className="space-y-8">
      {/* 2x2 Graph Grid */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClippedAreaChart
            title="Total Sales"
            description="Sales for each month"
            data={state.sales || []}
            dataKey="sales"
            xKey="month"
            config={{ sales: { label: 'Sales', color: '#3b82f6' } }}
          />
          <ClippedAreaChart
            title="Monthly Orders"
            description="Orders per date"
            data={state.orders || []}
            dataKey="orders"
            xKey="date"
            config={{ orders: { label: 'Orders', color: '#10b981' } }}
          />
          <ClippedAreaChart
            title="Products"
            description="Products tracked over time"
            data={state.products || []}
            dataKey="products"
            xKey="date"
            config={{ products: { label: 'Products', color: '#f59e0b' } }}
          />
          <ClippedAreaChart
            title="Total Users"
            description="User growth"
            data={state.users || []}
            dataKey="users"
            xKey="date"
            config={{ users: { label: 'Users', color: '#8b5cf6' } }}
          />
        </div>
      </section>

      {/* Lower Tabs Section */}
      <section className="data-section">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.name
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div>
          {tabs.find(tab => tab.name === activeTab)?.content}
        </div>
      </section>
    </div>
  );
}

// --- Placeholder Pages ---

function ContentModerationPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Content Moderation</h1>
      <p className="mt-4 text-gray-600">This is where content moderation tools and queues would appear.</p>
    </div>
  );
}

function SupportTicketPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
      <p className="mt-4 text-gray-600">This is where support tickets would be managed.</p>
    </div>
  );
}

// --- Main App Component ---

function DashboardApp() { // Renamed from App
  const [modalState, setModalState] = useState({ type: null, isOpen: false, data: null });
  const { dispatch } = useAppContext(); // Get dispatch from context

  const closeModal = () => setModalState({ type: null, isOpen: false, data: null });

  const handleConfirmDelete = () => {
    const { type, data } = modalState;
    if (type === 'delete-user' && data?.id) {
      dispatch({ type: 'DELETE_USER', payload: data.id });
    }
    if (type === 'delete-product' && data?.id) {
      dispatch({ type: 'DELETE_PRODUCT', payload: data.id });
    }
    if (type === 'delete-order' && data?.id) {
      dispatch({ type: 'DELETE_ORDER', payload: data.id });
    }
    closeModal();
  };
  
  const getItemType = () => {
    if (modalState.type?.includes('user')) return 'user';
    if (modalState.type?.includes('product')) return 'product';
    if (modalState.type?.includes('order')) return 'order';
    return 'item';
  }

  return (
      <>
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
          <Header />
          <main className="flex-grow p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<DashboardPage setModalState={setModalState} />} />
                <Route path="/moderation" element={<ContentModerationPage />} />
                <Route path="/support" element={<SupportTicketPage />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Modals */}
        <AddUserModal isOpen={modalState.type === 'add-user'} onClose={closeModal} />
        <AddProductModal isOpen={modalState.type === 'add-product'} onClose={closeModal} />
        <DeleteModal 
          isOpen={modalState.type?.startsWith('delete-')} 
          onClose={closeModal} 
          onConfirm={handleConfirmDelete}
          itemType={getItemType()}
        />

      </>
  );
}

// Final wrapper to include Context Provider
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch live data from backend when the admin app mounts.
  // NOTE: adjust endpoint paths below to match your backend routes.
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [uRes, pRes, oRes, fRes, sRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/products'),
          fetch('/api/orders'),
          fetch('/api/feedback'),
          fetch('/api/sales'),
        ]);

        if (!mounted) return;

        if (uRes.ok) dispatch({ type: 'SET_USERS', payload: await uRes.json() });
        if (pRes.ok) dispatch({ type: 'SET_PRODUCTS', payload: await pRes.json() });
        if (oRes.ok) dispatch({ type: 'SET_ORDERS', payload: await oRes.json() });
        if (fRes.ok) dispatch({ type: 'SET_FEEDBACK', payload: await fRes.json() });
        if (sRes.ok) dispatch({ type: 'SET_SALES', payload: await sRes.json() });
      } catch (err) {
        // Keep silent here; admin will still load with empty state. Log for debugging.
        // You can replace with toast/notification as needed.
        // console.error('Failed to load admin data', err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [dispatch]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <DashboardApp />
    </AppContext.Provider>
  );
}

