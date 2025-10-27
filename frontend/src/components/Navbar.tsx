const Navbar = () => {
  return (
    <nav className="bg-[#f8ead8] w-full h-16 flex items-center justify-between px-5 sticky top-0 z-[999] font-['Baloo_Bhai_2',sans-serif]">
      {/* Nav Items */}
      <ul className="flex gap-5 list-none">
        {/* Empty for now - add items as needed */}
      </ul>

      {/* Auth Buttons Container */}
      <div className="flex gap-2.5">
        <a href="/login">
          <button 
            type="button"
            className="bg-[#5c4033] text-[#f8ead8] border-2 border-[#5c4033] px-4 py-2.5 text-base font-bold rounded-[5px] cursor-pointer transition-all duration-300 hover:bg-[#8b4513] hover:border-[#8b4513]"
          >
            Login
          </button>
        </a>
        <a href="/signup">
          <button 
            type="button"
            className="bg-[#5c4033] text-[#f8ead8] border-2 border-[#5c4033] px-4 py-2.5 text-base font-bold rounded-[5px] cursor-pointer transition-all duration-300 hover:bg-[#8b4513] hover:border-[#8b4513]"
          >
            Signup
          </button>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;