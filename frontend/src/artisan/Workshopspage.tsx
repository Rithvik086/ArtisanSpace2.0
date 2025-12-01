"use client";

import { useState, useEffect } from "react";
import { AvailableWorkshopsTable } from "../components/workshops/AvailableWorkshopsTable";
import { AcceptedWorkshopsTable } from "../components/workshops/AcceptedWorkshopsTable";
import { type Workshop } from "../types/workshop";
import api from "../lib/axios";

export default function WorkshopsPage() {
  const [availableWorkshops, setAvailableWorkshops] = useState<Workshop[]>([]);
  const [acceptedWorkshops, setAcceptedWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingWorkshops, setAcceptingWorkshops] = useState<Set<string>>(
    new Set()
  );
  const [removingWorkshops, setRemovingWorkshops] = useState<Set<string>>(
    new Set()
  );

  const fetchData = async () => {
    try {
      const res = await api.get("/workshop/");
      setAvailableWorkshops(res.data.availableWorkshops);
      setAcceptedWorkshops(res.data.acceptedWorkshops);
    } catch (error) {
      console.error("Failed to load workshops.", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptWorkshop = async (workshopId: string) => {
    setAcceptingWorkshops((prev) => new Set(prev).add(workshopId));
    try {
      // Backend expects PUT to /api/v1/workshop/:action/:workshopId
      const response = await api.put(`/workshop/accept/${workshopId}`);

      if (response.status === 200) {
        // Refetch data to get latest
        await fetchData();
      }
    } catch (error) {
      console.error("Error accepting workshop:", error);
    } finally {
      setAcceptingWorkshops((prev) => {
        const newSet = new Set(prev);
        newSet.delete(workshopId);
        return newSet;
      });
    }
  };

  const handleRemoveWorkshop = async (workshopId: string) => {
    setRemovingWorkshops((prev) => new Set(prev).add(workshopId));
    try {
      // Backend exposes removal via PUT /api/v1/workshop/remove/:workshopId
      const response = await api.put(`/workshop/remove/${workshopId}`);

      if (response.status === 200) {
        // Refetch data
        await fetchData();
      }
    } catch (error) {
      console.error("Error removing workshop:", error);
    } finally {
      setRemovingWorkshops((prev) => {
        const newSet = new Set(prev);
        newSet.delete(workshopId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 p-8">
        <div className="container mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-amber-200">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-amber-300 rounded-full mx-auto mb-4"></div>
              <p className="text-amber-900 text-lg font-serif">
                Loading workshops...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-amber-900 font-serif mb-2">
            Workshop Management
          </h1>
          <p className="text-amber-700">
            Discover and manage your workshop opportunities
          </p>
        </div>
      </div>

      {/* Tabs are provided by the global ArtisanLayout header */}

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8 space-y-12">
        <AvailableWorkshopsTable
          workshops={availableWorkshops}
          onAccept={handleAcceptWorkshop}
          acceptingWorkshops={acceptingWorkshops}
        />
        <AcceptedWorkshopsTable
          workshops={acceptedWorkshops}
          onRemove={handleRemoveWorkshop}
          removingWorkshops={removingWorkshops}
        />
      </main>
    </div>
  );
}
