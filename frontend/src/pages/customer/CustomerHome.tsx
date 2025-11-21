import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import StaticThreeView from "@/components/StaticThreeView";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useSelector } from "react-redux";
import { useState, useCallback } from "react";

const CustomerHome = () => {
  const user = useSelector((state: any) => state.auth.user);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const [name, setName] = useState(
    user?.name ? capitalizeFirstLetter(user.name) : "Guest"
  );

  const welcomeText = `Welcome ${name}`;
  const [showMorphingText, setShowMorphingText] = useState(false);

  const handleTypingComplete = useCallback(() => {
    setTimeout(() => {
      setShowMorphingText(true);
    }, 1000);
  }, []);

  return (
    <>
      <CustomerHeader />
      <section className="pt-20 md:pt-0 md:h-screen grid grid-cols-1 md:grid-cols-2 bg-linear-to-r from-[#d4b996] to-[#5c4033] w-full">
        {/* --- LEFT SIDE --- */}
        <div className="h-full flex flex-col justify-center p-8 sm:p-16 md:pl-24 md:pr-12 text-center md:text-left">
          <div className="mt-10">
            <TypingAnimation
              className="text-5xl sm:text-7xl lg:text-[80px] text-amber-950 drop-shadow-lg leading-[1.2] font-black"
              onComplete={handleTypingComplete}
            >
              {welcomeText}
            </TypingAnimation>

            <div className="mt-8 flex justify-end md:justify-end">
              {/* {showMorphingText && (
                // <MorphingText
                //   texts={[
                //     "Discover unique handmade treasures",
                //     "Connect with talented artisans",
                //     "Find the perfect craft for you",
                //     "Explore artisanal excellence",
                //   ]}
                //   className="text-xl sm:text-3xl lg:text-4xl text-amber-900 font-semibold text-right"
                // />
              )} */}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE --- */}
        <div className="h-full flex items-center justify-center py-4 px-1 md:p-8">
          <StaticThreeView />
        </div>
      </section>
      <CustomerFooter />
    </>
  );
};

export default CustomerHome;
