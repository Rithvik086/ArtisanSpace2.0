// We'll use lucide-react for modern, clean icons
// You'll need to install it: npm install lucide-react
// import ScrollStack, { ScrollStackItem } from './components/ScrollStack'
import CircularGallery from "./components/CircularGallery";
import {
  ShoppingBag,
  Paintbrush,
  Users,
  Quote,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import Navbar from "./components/LandingPage/Navbar";
import HeroSection from "./components/LandingPage/HeroSection";
/*
--- FONT NOTE ---
To use the 'Kranky' font, you'll need to:
1. Add this to your public/index.html <head>:
   <link href="https://fonts.googleapis.com/css2?family=Kranky&family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">

2. Add 'Kranky' to your tailwind.config.js:
   theme: {
     extend: {
       fontFamily: {
         'kranky': ['Kranky', 'cursive'],
         'sans': ['Inter', 'sans-serif'] // Makes Inter the default sans-serif
       }
     }
   }
*/

// --- Placeholder for your 3D View ---
// I've created this placeholder so the app can run.
// You can replace this with your actual ThreeView component.

// --- 1. Navbar Component ---

// --- 3. Features Section ---
function FeaturesSection() {
  const features = [
    {
      icon: <Paintbrush size={32} className="text-amber-800" />,
      title: "Showcase Your Craft",
      description:
        "Upload high-quality photos and 3D models of your work to a beautiful, customizable storefront.",
    },
    {
      icon: <ShoppingBag size={32} className="text-amber-800" />,
      title: "Seamless E-Commerce",
      description:
        "Manage inventory, process payments, and handle shipping all from one simple, integrated dashboard.",
    },
    {
      icon: <Users size={32} className="text-amber-800" />,
      title: "Build Community",
      description:
        "Connect with other artisans, share techniques, and engage directly with customers who love your work.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-amber-800 tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-4xl md:text-5xl font-black text-amber-950">
            Everything You Need to Sell
          </p>
          <p className="mt-4 text-xl text-amber-900">
            Focus on your craft. We'll handle the rest.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-2xl font-bold text-amber-950">
                {feature.title}
              </h3>
              <p className="mt-4 text-base text-amber-900">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// // --- 4. How It Works Section ---
// function HowItWorksSection() {
//   const steps = [
//     {
//       number: '01',
//       title: 'Create Your Shop',
//       description: 'Sign up in minutes and customize your storefront to match your brand and style.',
//     },
//     {
//       number: '02',
//       title: 'List Your Products',
//       description: 'Easily upload your handmade goods with photos, descriptions, and 3D previews.',
//     },
//     {
//       number: '03',
//       title: 'Start Selling',
//       description: 'Go live and instantly connect with a global audience of craft lovers.',
//     },
//   ];

//   return (
//     <section id="how-it-works" className="py-20 md:py-32 bg-white overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         <div className="text-center max-w-3xl mx-auto">
//           <h2 className="text-4xl md:text-5xl font-black text-amber-950">
//             Get Started in 3 Easy Steps
//           </h2>
//           <p className="mt-4 text-xl text-amber-900">
//             From studio to storefront, faster than ever.
//           </p>
//         </div>

//         <div className="mt-20 relative">
//           {/* Decorative Line */}
//           <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-amber-200 hidden md:block" aria-hidden="true"></div>

//           <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
//             {steps.map((step) => (
//               <div key={step.number} className="text-center p-6 bg-amber-50 rounded-xl shadow-lg z-10">
//                 <span className="text-6xl font-black text-amber-800/30">{step.number}</span>
//                 <h3 className="mt-4 text-2xl font-bold text-amber-950">{step.title}</h3>
//                 <p className="mt-2 text-base text-amber-900">{step.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// --- 5. Testimonials Section ---
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "ArtisanSpace transformed my hobby into a business. The 3D viewer is a game-changer for my pottery!",
      name: "Sarah Chen",
      title: "Potter, Chen's Ceramics",
      avatar: "https://placehold.co/100x100/d4b996/5c4033?text=SC",
    },
    {
      quote:
        "Finally, a platform that understands artisans. The community features are fantastic for collaborating.",
      name: "David Lee",
      title: "Jewelry Maker, Lee Metals",
      avatar: "https://placehold.co/100x100/d4b996/5c4033?text=DL",
    },
    {
      quote:
        "I was hesitant about selling online, but ArtisanSpace made it incredibly simple. My sales have doubled!",
      name: "Maria Gonzalez",
      title: "Weaver, Casa Textiles",
      avatar: "https://placehold.co/100x100/d4b996/5c4033?text=MG",
    },
  ];

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-amber-950">
            From Our Artisans
          </h2>
          <p className="mt-4 text-xl text-amber-900">
            Don't just take our word for it.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-8 grow">
                <Quote className="text-amber-800/30" size={48} />
                <blockquote className="mt-4 text-lg font-medium text-amber-900">
                  "{testimonial.quote}"
                </blockquote>
              </div>
              <div className="bg-amber-100 p-6 flex items-center space-x-4">
                <img
                  className="h-12 w-12 rounded-full"
                  src={testimonial.avatar}
                  alt={testimonial.name}
                />
                <div>
                  <p className="text-base font-bold text-amber-950">
                    {testimonial.name}
                  </p>
                  <p className="text-sm font-medium text-amber-800">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 6. Final CTA Section ---
function CTASection() {
  return (
    <section className="bg-linear-to-r from-[#5c4033] to-[#4a3227] py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-6xl font-black text-white">
          Join a Community of Creators
        </h2>
        <p className="mt-6 text-xl text-amber-100 max-w-2xl mx-auto">
          Ready to turn your passion into your profession? Open your shop on
          ArtisanSpace today and start selling.
        </p>
        <div className="mt-10">
          <button className="px-12 py-5 bg-white text-amber-950 rounded-lg font-semibold text-xl hover:bg-amber-50 transition-colors duration-300 shadow-2xl hover:shadow-xl transform hover:-translate-y-1 hover:cursor-pointer">
            Sign Up for Free
            <ArrowRight className="inline-block ml-2" size={20} />
          </button>
        </div>
        <p className="mt-6 text-sm text-amber-200">
          No setup fees. No monthly fees.
        </p>
      </div>
    </section>
  );
}

// --- 7. Footer Component ---
function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Examples", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookies", href: "#" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: <Facebook size={24} />, href: "#" },
    { name: "Twitter", icon: <Twitter size={24} />, href: "#" },
    { name: "Instagram", icon: <Instagram size={24} />, href: "#" },
  ];

  return (
    <footer className="bg-white border-t border-amber-200">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Link Sections */}
          {(
            Object.entries(footerLinks) as Array<
              [keyof typeof footerLinks, { name: string; href: string }[]]
            >
          ).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-amber-950 tracking-wider uppercase">
                {category}
              </h3>
              <ul className="mt-4 space-y-4">
                {links.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-base text-amber-900 hover:text-amber-950"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter (Example) */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-amber-950 tracking-wider uppercase">
              Subscribe
            </h3>
            <p className="mt-4 text-base text-amber-900">
              Get inspiration and updates from the artisan world.
            </p>
            <form className="mt-4 flex sm:flex-col">
              <input
                type="email"
                placeholder="Enter your email"
                className="grow w-full min-w-0 px-4 py-2 border border-amber-300 rounded-md shadow-sm focus:ring-amber-800 focus:border-amber-800"
              />
              <button
                type="submit"
                className="mt-0 sm:mt-3 ml-3 sm:ml-0 w-auto px-4 py-2 bg-amber-950 text-white rounded-md font-semibold hover:bg-amber-900"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-amber-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-amber-900">
            &copy; {new Date().getFullYear()} ArtisanSpace. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-amber-900 hover:text-amber-950"
              >
                <span className="sr-only">{item.name}</span>
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Main App Component ---
// This brings all the sections together.
export default function App() {
  return (
    <div className="bg-amber-50 font-sans text-gray-900">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <div style={{ height: "600px", position: "relative" }}>
          <CircularGallery
            bend={2}
            textColor="amber-900"
            borderRadius={0.2}
            scrollEase={0.02}
          />
        </div>

        {/* <HowItWorksSection /> */}
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
