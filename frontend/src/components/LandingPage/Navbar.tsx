import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// We'll use lucide-react for modern, clean icons
// You'll need to install it: npm install lucide-react
import { Menu, X } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="#" className="flex-0 flex items-center">
            <h1 className="font-bold text-amber-950 text-3xl font-kranky">
              ArtisanSpace
            </h1>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="font-semibold text-lg text-amber-900 hover:text-amber-950 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-6 py-2 bg-transparent border-2 border-amber-950 text-amber-950 rounded-lg font-semibold hover:bg-amber-950 hover:text-amber-100 transition-all duration-300 hover:cursor-pointer">
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-amber-950 text-amber-100 rounded-lg font-semibold hover:bg-amber-900 transition-colors duration-300 shadow-lg hover:shadow-xl hover:cursor-pointer"
            >
              Signup
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-amber-950"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg pb-6">
          <div className="flex flex-col space-y-4 px-4 pt-2 pb-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-amber-900 hover:bg-amber-100"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="flex flex-col space-y-4 px-4">
            <button
              onClick={() => {
                navigate("/login");
                setIsOpen(false);
              }}
              className="w-full px-6 py-3 bg-transparent border-2 border-amber-950 text-amber-950 rounded-lg font-semibold hover:bg-amber-950 hover:text-amber-100 transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate("/signup");
                setIsOpen(false);
              }}
              className="w-full px-6 py-3 bg-amber-950 text-amber-100 rounded-lg font-semibold hover:bg-amber-900 transition-colors duration-300 shadow-lg"
            >
              Signup
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
