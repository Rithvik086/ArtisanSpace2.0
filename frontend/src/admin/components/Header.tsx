import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, LifeBuoy, Menu } from 'lucide-react';

export default function Header(): React.ReactElement {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
        : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
    }`;

  return (
    <header className="bg-linear-to-r from-amber-50 to-orange-50 shadow-lg border-b-2 border-amber-200 sticky top-0 z-30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0 flex items-center">
            <h1 className="text-2xl font-bold text-amber-900 font-serif">ArtisanSpace Admin</h1>
          </div>
          <div className="hidden md:flex md:ml-6">
            <nav className="flex space-x-3">
              <NavLink to="/admin" className={navLinkClass}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/moderation" className={navLinkClass}>
                <ShieldCheck size={18} />
                <span>Content Moderation</span>
              </NavLink>
              <NavLink to="/admin/support" className={navLinkClass}>
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
