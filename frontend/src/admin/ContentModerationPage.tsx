import React, { useState } from 'react';
import ModerationProductCard from './components/ModerationProductCard';
import { useAppContext } from './AppContext';

export default function ContentModerationPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { state } = useAppContext();
  const { products } = state;

  const approvedProducts = products.filter(p => p.status === 'approved');
  const pendingProducts = products.filter(p => p.status === 'pending');
  const disapprovedProducts = products.filter(p => p.status === 'disapproved');

  const getTabClass = (tabName: string): string => 
    `py-3 px-4 font-medium text-center cursor-pointer ${activeTab === tabName ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`;

  const getTabContent = (): React.ReactElement => {
    let productsToShow: any[] = [];
    switch (activeTab) {
      case 'approved': productsToShow = approvedProducts; break;
      case 'pending': productsToShow = pendingProducts; break;
      case 'disapproved': productsToShow = disapprovedProducts; break;
      default: productsToShow = [];
    }
    if (productsToShow.length === 0) return <p className="text-gray-500 text-center py-10">No products in this category.</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsToShow.map(p => <ModerationProductCard key={p.id} product={p} />)}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Products</h2>
      <div className="border-b border-gray-200">
        <div className="flex -mb-px">
          <div className={getTabClass('approved')} onClick={() => setActiveTab('approved')}>Approved <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{approvedProducts.length}</span></div>
          <div className={getTabClass('pending')} onClick={() => setActiveTab('pending')}>Pending <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">{pendingProducts.length}</span></div>
          <div className={getTabClass('disapproved')} onClick={() => setActiveTab('disapproved')}>Disapproved <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">{disapprovedProducts.length}</span></div>
        </div>
      </div>
      <div className="py-6">{getTabContent()}</div>
    </div>
  );
}
