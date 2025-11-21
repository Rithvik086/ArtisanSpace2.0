import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { useDispatch } from "../redux/store";
import { logoutUser } from "../redux/slices/authThunks";
import type { RootState } from "../redux/store";

export default function ArtisanNavbar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const navItems = [
    { name: "Dashboard", href: "/artisan" },
    { name: "Listings", href: "/artisan/listings" },
    { name: "Workshops", href: "/artisan/workshops" },
    { name: "Custom Requests", href: "/artisan/customrequests" },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/artisan" className="flex items-center">
            <h1 className="font-bold text-amber-950 text-3xl font-kranky">
              ArtisanSpace
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="font-semibold text-lg text-amber-900 hover:text-amber-950 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-amber-900 font-medium">
              Welcome, {user?.name || user?.username}
            </span>
            <button
              onClick={() => navigate("/artisan/settings")}
              className="text-amber-900 hover:text-amber-950 p-2 rounded-md transition-colors"
              title="Settings"
            >
              <User size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="text-amber-900 hover:text-amber-950 p-2 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-amber-950"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-amber-900 hover:text-amber-950 hover:bg-amber-100"
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2">
              <button
                onClick={() => {
                  navigate("/artisan/settings");
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-amber-900 hover:text-amber-950 hover:bg-amber-100"
              >
                <User size={20} className="mr-2" />
                Settings
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-amber-900 hover:text-amber-950 hover:bg-amber-100"
              >
                <LogOut size={20} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
