import StaticThreeView from "@/components/StaticThreeView";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useSelector } from "react-redux";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { RootState } from "../../redux/store";
import CustomerOrders from "./CustomerOrders";
import { Home, Package } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const CustomerHome = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"home" | "orders">("home");

  // Check for tab parameter on component mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "orders") {
      setActiveTab("orders");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "home" | "orders") => {
    setActiveTab(tab);
    if (tab === "orders") {
      setSearchParams({ tab: "orders" });
    } else {
      setSearchParams({});
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const name = useMemo(
    () => (user?.name ? capitalizeFirstLetter(user.name) : "Guest"),
    [user?.name]
  );

  const welcomeText = `Welcome ${name}`;
  const [, setShowMorphingText] = useState(false);

  const handleTypingComplete = useCallback(() => {
    setTimeout(() => {
      setShowMorphingText(true);
    }, 1000);
  }, []);

  return (
    <>
      <div>
        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange("home")}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "home"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Home size={18} />
                <span>Home</span>
              </button>
              <button
                onClick={() => handleTabChange("orders")}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package size={18} />
                <span>My Orders</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "home" && (
          <section className="h-screen grid grid-cols-1 md:grid-cols-2 bg-linear-to-r from-[#d4b996] to-[#5c4033] w-full">
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
        )}

        {activeTab === "orders" && <CustomerOrders />}
      </div>
    </>
  );
};

export default CustomerHome;
