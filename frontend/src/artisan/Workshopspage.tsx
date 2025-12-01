"use client";

import { useState, useEffect, useMemo } from "react";
import { AvailableWorkshopsTable } from "../components/workshops/AvailableWorkshopsTable";
import { AcceptedWorkshopsTable } from "../components/workshops/AcceptedWorkshopsTable";
import { type Workshop } from "../types/workshop";
import api from "../lib/axios";
import {
  Search,
  Calendar,
  CheckCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { craftStyles, cn } from "../styles/theme";

export default function WorkshopsPage() {
  const [availableWorkshops, setAvailableWorkshops] = useState<Workshop[]>([]);
  const [acceptedWorkshops, setAcceptedWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [acceptingWorkshops, setAcceptingWorkshops] = useState<Set<string>>(
    new Set()
  );
  const [removingWorkshops, setRemovingWorkshops] = useState<Set<string>>(
    new Set()
  );

  const fetchData = async () => {
    try {
      setError(null);
      const res = await api.get("/workshop/");
      setAvailableWorkshops(res.data.availableWorkshops);
      setAcceptedWorkshops(res.data.acceptedWorkshops);
    } catch (error) {
      console.error("Failed to load workshops.", error);
      setError("Failed to load workshops. Please try again.");
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
      const response = await api.put(`/workshop/accept/${workshopId}`);
      if (response.status === 200) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error accepting workshop:", error);
      setError("Failed to accept workshop. Please try again.");
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
      const response = await api.put(`/workshop/remove/${workshopId}`);
      if (response.status === 200) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error removing workshop:", error);
      setError("Failed to remove workshop. Please try again.");
    } finally {
      setRemovingWorkshops((prev) => {
        const newSet = new Set(prev);
        newSet.delete(workshopId);
        return newSet;
      });
    }
  };

  // Filtered workshops based on search
  const filteredAvailableWorkshops = useMemo(() => {
    return availableWorkshops.filter(
      (workshop) =>
        workshop.workshopTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workshop.userId.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workshop.workshopDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [availableWorkshops, searchTerm]);

  const filteredAcceptedWorkshops = useMemo(() => {
    return acceptedWorkshops.filter(
      (workshop) =>
        workshop.workshopTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workshop.userId.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workshop.workshopDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [acceptedWorkshops, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 p-8">
        <div className="container mx-auto text-center">
          <div
            className={cn(
              craftStyles.card.warm,
              "p-8 shadow-lg border border-amber-200"
            )}
          >
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-amber-300 rounded-full mx-auto"></div>
              <div className="w-48 h-6 bg-amber-300 rounded mx-auto"></div>
              <div className="w-32 h-4 bg-amber-200 rounded mx-auto"></div>
            </div>
            <p className="text-amber-900 text-lg font-baloo mt-4 animate-bounce">
              Loading workshops...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Statistics Cards */}
      <div className="container mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 font-baloo mb-2">
            Workshop Management
          </h1>
          <p className="text-amber-700 font-baloo text-lg">
            Discover and manage your workshop opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={cn(craftStyles.card.warm, "p-6 text-center")}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Calendar className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900 font-baloo">
                  {availableWorkshops.length}
                </p>
                <p className="text-amber-700 font-baloo text-sm">
                  Available Workshops
                </p>
              </div>
            </div>
          </div>

          <div className={cn(craftStyles.card.warm, "p-6 text-center")}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900 font-baloo">
                  {acceptedWorkshops.length}
                </p>
                <p className="text-amber-700 font-baloo text-sm">
                  Accepted Workshops
                </p>
              </div>
            </div>
          </div>

          <div className={cn(craftStyles.card.warm, "p-6 text-center")}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900 font-baloo">
                  {acceptedWorkshops.length + availableWorkshops.length}
                </p>
                <p className="text-amber-700 font-baloo text-sm">
                  Total Opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workshops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                craftStyles.input.default,
                "pl-10 pr-4 py-3 text-amber-900 placeholder-amber-500 font-baloo"
              )}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 max-w-md">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-800 font-baloo text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8 space-y-12">
        <AvailableWorkshopsTable
          workshops={filteredAvailableWorkshops}
          onAccept={handleAcceptWorkshop}
          acceptingWorkshops={acceptingWorkshops}
          searchTerm={searchTerm}
        />
        <AcceptedWorkshopsTable
          workshops={filteredAcceptedWorkshops}
          onRemove={handleRemoveWorkshop}
          removingWorkshops={removingWorkshops}
          searchTerm={searchTerm}
        />
      </main>
    </div>
  );
}
