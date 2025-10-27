import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  role?: 'customer' | 'admin' | 'artisan' | 'manager' | string;
}

const Header: React.FC<HeaderProps> = ({ role = 'customer' }) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const renderNavItems = () => {
    switch (role) {
      case "customer":
        return (
          <>
            <li className="list-none">
              <a href="/customer" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Home
              </a>
            </li>
            <li className="list-none">
              <a href="/customer/store" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Store
              </a>
            </li>
            <li className="list-none">
              <a href="/customer/cart" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Cart
              </a>
            </li>
            <li className="list-none">
              <a href="/customer/workshop" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Workshops
              </a>
            </li>
            <li className="list-none">
              <a href="/customer/customorder" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Custom Order
              </a>
            </li>
          </>
        );
      case "admin":
        return (
          <>
            <li className="list-none">
              <a href="/admin" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Dashboard
              </a>
            </li>
            <li className="list-none">
              <a href="/admin/content-moderation" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Content Moderation
              </a>
            </li>
            <li className="list-none">
              <a href="/admin/support-ticket" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Support-ticket
              </a>
            </li>
          </>
        );
      case "artisan":
        return (
          <>
            <li className="list-none">
              <a href="/artisan/" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Dashboard
              </a>
            </li>
            <li className="list-none">
              <a href="/artisan/listings" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Listings
              </a>
            </li>
            <li className="list-none">
              <a href="/artisan/workshops" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Workshops
              </a>
            </li>
            <li className="list-none">
              <a href="/artisan/customrequests" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Custom Requests
              </a>
            </li>
          </>
        );
      case "manager":
        return (
          <>
            <li className="list-none">
              <a href="/manager" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Dashboard
              </a>
            </li>
            <li className="list-none">
              <a href="/manager/content-moderation" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Content Moderation
              </a>
            </li>
            <li className="list-none">
              <a href="/manager/listing" className="text-[#f8ead8] no-underline font-semibold px-2.5 py-1.5 rounded-[5px] transition-colors duration-300 hover:bg-[#8b4513]">
                Listings
              </a>
            </li>
          </>
        );
      default:
        return null;
    }
  };

  const getSettingsUrl = () => {
    switch (role) {
      case "customer": return "/customer/settings";
      case "admin": return "/admin/settings";
      case "artisan": return "/artisan/settings";
      case "manager": return "/manager/settings";
      default: return "/settings";
    }
  };

  return (
    <header className="bg-[#5c4033] text-[#f8ead8] py-5 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      <div className="h-[6vh] w-[90%] max-w-[1200px] mx-auto flex justify-between items-center font-['Baloo_Bhai_2',sans-serif] text-base">
        {/* Logo */}
        <div className="text-[28px] font-extrabold">
          ArtisanSpace
        </div>

        {/* Navigation */}
        <nav className="flex items-center">
          <ul className="list-none flex gap-5 p-0 m-0">
            {renderNavItems()}
            
            {/* Dropdown */}
            <li className="list-none ml-2.5 relative inline-block cursor-pointer" ref={dropdownRef}>
              <i 
                className="fa-solid fa-bars fa-lg text-[#f8ead8]" 
                onClick={toggleDropdown}
              ></i>
              
              {dropdownOpen && (
                <div 
                  className="absolute top-[40px] left-[-50px] bg-[#f8f9fa] text-black rounded-xl p-2.5 w-[120px] shadow-[0px_5px_15px_rgba(0,0,0,0.2)] z-[1000]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a 
                    href={getSettingsUrl()} 
                    className="flex items-center py-2 px-2.5 w-full text-base text-left no-underline text-black cursor-pointer rounded-md transition-colors duration-200 hover:bg-gray-200"
                  >
                    <i className="fa-solid fa-gear mr-2 text-[#5c4033]"></i>
                    <p className="text-[#5c4033] m-0">Settings</p>
                  </a>
                  <a 
                    href="/logout" 
                    className="flex items-center py-2 px-2.5 w-full text-base text-left no-underline text-black cursor-pointer rounded-md transition-colors duration-200 hover:bg-gray-200"
                  >
                    <i className="fa-solid fa-right-from-bracket mr-2 text-[#5c4033]"></i>
                    <p className="text-[#5c4033] m-0">Logout</p>
                  </a>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;