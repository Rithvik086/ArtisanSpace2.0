"use client";

import { useState, useEffect } from "react";
import { AvailableWorkshopsTable } from "../components/workshops/AvailableWorkshopsTable";
import { AcceptedWorkshopsTable } from "../components/workshops/AcceptedWorkshopsTable";
import { type Workshop } from "../types/workshop";

// --- MOCK DATA (Replace with your actual API call) ---
const mockAvailableWorkshops: Workshop[] = [
  {
    _id: "w1",
    workshopTitle: "Pottery Wheel Throwing Basics",
    workshopDescription: "Learn the fundamentals of shaping clay on the pottery wheel. Perfect for beginners.",
    userId: { username: "Clay Creations Co." },
    date: "2025-11-15",
    time: "10:00 AM",
  },
  {
    _id: "w2",
    workshopTitle: "Wooden Sculpture Carving",
    workshopDescription: "Discover the art of carving intricate designs into wood blocks using traditional tools.",
    userId: { username: "WoodWorks Guild" },
    date: "2025-11-22",
    time: "01:00 PM",
  },
];

const mockAcceptedWorkshops: Workshop[] = [
  {
    _id: "w3",
    workshopTitle: "Advanced Watercolor Painting",
    workshopDescription: "Master advanced techniques like wet-on-wet, glazing, and lifting to create stunning watercolor art.",
    userId: { 
      username: "Alice Johnson", 
      email: "alice@example.com", 
      mobile_no: "987-654-3210" 
    },
    date: "2025-11-10",
    time: "02:00 PM",
    acceptedAt: "2025-10-28T10:00:00.000Z",
  },
];
// --- END MOCK DATA ---

export default function WorkshopsPage() {
  const [availableWorkshops, setAvailableWorkshops] = useState<Workshop[]>([]);
  const [acceptedWorkshops, setAcceptedWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    // In a real app, you would fetch this from your API
    // const fetchData = async () => {
    //   try {
    //     const res = await fetch('/api/artisan/workshops');
    //     const data = await res.json();
    //     setAvailableWorkshops(data.available);
    //     setAcceptedWorkshops(data.accepted);
    //   } catch (error) {
    //     toast.error("Failed to load workshops.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchData();

    // Using mock data for demonstration
    setAvailableWorkshops(mockAvailableWorkshops);
    setAcceptedWorkshops(mockAcceptedWorkshops);
    setLoading(false);
  }, []);

  const handleAcceptWorkshop = async (workshopId: string) => {
    try {
      // Backend expects PUT to /api/v1/workshop/:action/:workshopId
      const response = await fetch(`/api/v1/workshop/accept/${workshopId}`, {
        method: 'PUT',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Optimistically update the UI for a better user experience
        const workshopToMove = availableWorkshops.find(w => w._id === workshopId);
        if (workshopToMove) {
          setAvailableWorkshops(prev => prev.filter(w => w._id !== workshopId));
          setAcceptedWorkshops(prev => [...prev, { ...workshopToMove, acceptedAt: new Date().toISOString() }]);
        }
        alert("Workshop accepted successfully!");
      } else {
        alert("Failed to accept workshop.");
      }
    } catch (error) {
      console.error("Error accepting workshop:", error);
      alert("Failed to accept workshop.");
    }
  };

  const handleRemoveWorkshop = async (workshopId: string) => {
    try {
      // Backend exposes removal via PUT /api/v1/workshop/remove/:workshopId
      const response = await fetch(`/api/v1/workshop/remove/${workshopId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        // Optimistically update UI
        setAcceptedWorkshops(prev => prev.filter(w => w._id !== workshopId));
        alert("Workshop removed successfully!");
      } else {
        alert("Failed to remove workshop.");
      }
    } catch (error) {
      console.error("Error removing workshop:", error);
      alert("Failed to remove workshop.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8">
        <div className="container mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-amber-200">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-amber-300 rounded-full mx-auto mb-4"></div>
              <p className="text-amber-900 text-lg font-serif">Loading workshops...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-amber-900 font-serif mb-2">Workshop Management</h1>
          <p className="text-amber-700">Discover and manage your workshop opportunities</p>
        </div>
      </div>

      {/* Tabs are provided by the global ArtisanLayout header */}

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8 space-y-12">
        <AvailableWorkshopsTable 
          workshops={availableWorkshops} 
          onAccept={handleAcceptWorkshop} 
        />
        <AcceptedWorkshopsTable 
          workshops={acceptedWorkshops} 
          onRemove={handleRemoveWorkshop} 
        />
      </main>
    </div>
  );
}