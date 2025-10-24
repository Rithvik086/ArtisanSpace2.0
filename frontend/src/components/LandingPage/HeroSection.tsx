import ThreeView from "../ThreeView";

// --- 2. Hero Section (Your Component, adapted) ---
function HeroSection() {
  return (
    // THIS is the corrected line:
    <section className='pt-20 md:pt-0 md:h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-r from-[#d4b996] to-[#5c4033] w-full'>
      
      {/* --- LEFT SIDE --- */}
      <div className='h-full flex flex-col justify-center p-8 sm:p-16 md:pl-24 md:pr-12 text-center md:text-left'>
        
        {/* The user's original hero content */}
        <div className='mt-10'>
          <p className='text-5xl sm:text-7xl lg:text-[80px] text-amber-950 drop-shadow-lg leading-[1.2] font-black'>
            Where Craft Meets Customer
          </p>
          <p className='text-xl sm:text-2xl lg:text-[30px] text-amber-900 drop-shadow-md mt-6 max-w-xl mx-auto md:mx-0'>
            ArtisanSpace bridges creativity and commerce for handmade treasures
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center md:justify-start mt-10 space-y-4 sm:space-y-0 sm:space-x-6'>
            <button className='w-full sm:w-auto px-10 py-4 bg-amber-950 text-amber-100 rounded-lg font-semibold text-lg hover:bg-amber-900 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'>
              Get Started Free
            </button>
            <button className='w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-amber-950 text-amber-950 rounded-lg font-semibold text-lg hover:bg-amber-950 hover:text-amber-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'>
              How it Works
            </button>
          </div>
        </div>
      </div>

    
      <div className='h-full flex items-center justify-center py-4 px-1 md:p-8'>
        {/* This will render your 3D component or the placeholder */}
        <ThreeView />
      </div>
    </section>
  );
}

export default HeroSection;