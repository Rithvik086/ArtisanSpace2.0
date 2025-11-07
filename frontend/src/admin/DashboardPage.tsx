import React, { useState, useEffect } from 'react';
import GraphCard from './components/GraphCard';
import { DollarSign, BarChart2, PackageCheck, Users2, Users, Package, ShoppingCart, MessageSquare } from 'lucide-react';
import UsersTab from './tabs/UsersTab';
import ProductsTab from './tabs/ProductsTab';
import OrdersTab from './tabs/OrdersTab';
import FeedbackTab from './tabs/FeedbackTab';
import { useAppContext } from './AppContext';

export default function DashboardPage({ setModalState }: { setModalState: React.Dispatch<React.SetStateAction<any>> }) {
  const [activeTab, setActiveTab] = useState<string>('Users');
  const { state } = useAppContext();
  const users = state.users;
  const products = state.products;
  const orders = state.orders;
  const feedback = state.feedback;
  const [sales, setSales] = useState<Array<{ month: string; sales: number }>>([]);
  const [ordersChart, setOrdersChart] = useState<any[]>([]);
  const [productsChart, setProductsChart] = useState<any[]>([]);
  const [usersChart, setUsersChart] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function buildMonthlyCounts(items: any[], dateKey: string, outKey: string) {
    const map = new Map<string, number>();
    items.forEach(it => {
      try {
        const d = new Date(it[dateKey]);
        if (isNaN(d.getTime())) return;
        const m = d.toLocaleString('en-US', { month: 'short' });
        map.set(m, (map.get(m) || 0) + 1);
      } catch (e) {}
    });
    return MONTHS.map(m => ({ date: m, [outKey]: map.get(m) || 0 }));
  }

  async function fetchSales() {
    setLoadingData(true);
    try {
      const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || `${location.protocol}//${location.hostname}:3000`;
      const sRes = await fetch(`${API_BASE}/api/sales`, { credentials: 'include' });
      const sJson = await sRes.json().catch(() => []);
      setSales(Array.isArray(sJson) ? sJson : []);
    } catch (e) {
      console.error('Failed fetching sales data', e);
    } finally { setLoadingData(false); }
  }

  useEffect(() => { void fetchSales(); }, []);

  useEffect(() => {
    setOrdersChart(buildMonthlyCounts(orders || [], 'purchasedAt', 'orders'));
    setProductsChart(buildMonthlyCounts(products || [], 'createdAt', 'products'));
    setUsersChart(buildMonthlyCounts(users || [], 'createdAt', 'users'));
  }, [orders, products, users]);

  const tabs = [
    { name: 'Users', icon: Users, content: <UsersTab setModalState={setModalState} /> },
    { name: 'Products', icon: Package, content: <ProductsTab setModalState={setModalState} /> },
    { name: 'Orders', icon: ShoppingCart, content: <OrdersTab setModalState={setModalState} /> },
    { name: 'Feedback', icon: MessageSquare, content: <FeedbackTab /> },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-amber-900 mb-4 font-serif">Dashboard Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <button onClick={() => setActiveTab('Users')} className="p-4 text-left bg-white rounded-md"> 
            <div className="text-sm font-medium text-amber-900">Users</div>
            <div className="text-2xl font-bold text-amber-800">{loadingData ? '—' : users.length}</div>
          </button>
          <button onClick={() => setActiveTab('Products')} className="p-4 text-left bg-white rounded-md"> 
            <div className="text-sm font-medium text-amber-900">Products</div>
            <div className="text-2xl font-bold text-amber-800">{loadingData ? '—' : products.length}</div>
          </button>
          <button onClick={() => setActiveTab('Orders')} className="p-4 text-left bg-white rounded-md"> 
            <div className="text-sm font-medium text-amber-900">Orders</div>
            <div className="text-2xl font-bold text-amber-800">{loadingData ? '—' : orders.length}</div>
          </button>
          <button onClick={() => setActiveTab('Feedback')} className="p-4 text-left bg-white rounded-md"> 
            <div className="text-sm font-medium text-amber-900">Feedback</div>
            <div className="text-2xl font-bold text-amber-800">{loadingData ? '—' : feedback.length}</div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GraphCard title="Total Sales" data={sales} dataKey="sales" xKey="month" icon={DollarSign} unit="₹" />
          <GraphCard title="Monthly Orders" data={ordersChart} dataKey="orders" xKey="date" icon={BarChart2} />
          <GraphCard title="Products" data={productsChart} dataKey="products" xKey="date" icon={PackageCheck} />
          <GraphCard title="Total Users" data={usersChart} dataKey="users" xKey="date" icon={Users2} />
        </div>
      </section>

      <section className="data-section">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.name ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  <tab.icon size={18} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div>{tabs.find(tab => tab.name === activeTab)?.content}</div>
      </section>
    </div>
  );
}
