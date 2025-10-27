const Header = () => {    
  return (
    <header className="w-full h-[129px] sticky top-0 z-[1000] bg-black relative flex items-center justify-between px-5">
      {/* Background Image */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-60 -z-10"
        style={{ backgroundImage: "url('/images/header&footer/artrithvik_11zon.jpg')" }}
      ></div>

      <div className="flex justify-between items-center w-full h-full">
        {/* Logo */}
        <div className="relative -left-[60px] w-[350px]">
          <img 
            src="/assets/logo.png" 
            alt="logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;