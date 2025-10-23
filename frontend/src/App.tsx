import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ThreeView from './components/ThreeView'
// In your main.jsx or App.jsx



function App() {
  return (
    <>
      <section className='h-screen grid grid-cols-2 bg-linear-to-r from-[#d4b996] to-[#5c4033] vw-full'>
        <div className='h-full'>
          <h2 className='font-bold text-amber-950 text-[40px] px-20 py-15 mx-16 font-kranky '>ArtisanSpace</h2>
          <div className='flex flex-col justify-center items-center pt-19 mt-19 pl-10 font-bold ml-20'>
            <p className='text-[80px] text-amber-950 drop-shadow-lg leading-[1.2] pb-8'>Where Craft Meets Customer</p>
            <p className='text-[30px] text-amber-900 drop-shadow-md pb-8'>ArtisanSpace bridges creativity and commerce for handmade treasures</p>
            <div className='flex items-start'>
              <button className='m-5 px-8 py-3 bg-amber-950 text-amber-100 rounded-lg font-semibold hover:bg-amber-900 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'>
                Signup
              </button>
              <button className='m-5 px-8 py-3 bg-transparent border-2 border-amber-950 text-amber-950 rounded-lg font-semibold hover:bg-amber-950 hover:text-amber-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'>
                Login
              </button>
            </div>
          </div>
        </div>
        <div className='h-full'>

          <ThreeView />
        </div>
      </section>
    </>
  )
}

export default App