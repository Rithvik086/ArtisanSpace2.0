import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Package, CalendarDays, FileText, Plus } from 'lucide-react';

export default function ArtisanNavbar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', href: '/artisan', icon: <LayoutDashboard size={18} /> },
    { name: 'Listings', href: '/artisan/listings', icon: <Package size={18} /> },
    { name: 'Workshops', href: '/artisan/workshops', icon: <CalendarDays size={18} /> },
    { name: 'Custom Requests', href: '/artisan/customrequests', icon: <FileText size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/artisan')}
              className="font-bold text-amber-950 text-3xl font-kranky transform transition duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              ArtisanSpace
            </button>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className="font-semibold text-lg text-amber-900 hover:text-amber-950 transform transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-2 px-3 py-2"
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => navigate('/artisan/listings')}
              className="px-4 py-2 bg-amber-900 text-white rounded-md font-semibold hover:bg-amber-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add New</span>
            </button>
          </div> */}

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-amber-950 transform transition duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-200">
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 shadow-lg pb-4">
          <div className="flex flex-col space-y-2 px-4 pt-3 pb-3">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => { navigate(item.href); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-amber-900 hover:bg-amber-50 transform transition duration-150 ease-out hover:-translate-y-1 hover:shadow-md active:scale-95 flex items-center gap-3 font-semibold"
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => { navigate('/artisan/listings'); setIsOpen(false); }}
              className="w-full px-4 py-3 bg-amber-950 text-amber-100 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transform transition duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <Plus size={16} />
              Add New Listing
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
