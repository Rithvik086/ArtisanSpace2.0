import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { useDispatch } from "../redux/store";
import { logoutUser } from "../redux/slices/authThunks";
import type { RootState } from "../redux/store";

export default function DeliveryNavbar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const navItems = [{ name: "Dashboard", href: "/delivery" }];

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
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/delivery" className="flex items-center group">
            <h1 className="font-bold text-amber-950 text-3xl font-kranky group-hover:text-amber-800 transition-colors">
              ArtisanSpace
            </h1>
            <span className="ml-2 text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-semibold">
              Delivery
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="relative px-3 py-2 font-semibold text-lg text-amber-900 hover:text-amber-950 transition-colors font-baloo group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-amber-900 font-medium font-baloo bg-amber-50 px-3 py-2 rounded-lg">
              Welcome,{" "}
              <span className="font-semibold">
                {user?.name || user?.username}
              </span>
            </div>
            <button
              onClick={() => navigate("/delivery/settings")}
              className="text-amber-900 hover:text-amber-950 p-2 rounded-lg hover:bg-amber-100 transition-all duration-200"
              title="Settings"
            >
              <User size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="text-amber-900 hover:text-amber-950 p-2 rounded-lg hover:bg-amber-100 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-amber-950 p-2 rounded-lg hover:bg-amber-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg border-t border-amber-100">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-amber-900 hover:text-amber-950 hover:bg-amber-50 font-baloo transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-amber-100 pt-4 mt-4 space-y-2">
              <div className="px-4 py-2 text-sm text-amber-700 font-baloo">
                Welcome,{" "}
                <span className="font-semibold">
                  {user?.name || user?.username}
                </span>
              </div>
              <button
                onClick={() => {
                  navigate("/delivery/settings");
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-amber-900 hover:text-amber-950 hover:bg-amber-50 font-baloo transition-all"
              >
                <User size={20} className="mr-3" />
                Settings
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-amber-900 hover:text-amber-950 hover:bg-amber-50 font-baloo transition-all"
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
