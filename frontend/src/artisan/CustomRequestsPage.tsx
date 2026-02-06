import React, { useState, useEffect, useMemo } from "react";
import { craftStyles, cn } from "../styles/theme";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Search,
} from "lucide-react";
import api from "../lib/axios";

interface CustomRequest {
  _id: string;
  title: string;
  type: string;
  image: string;
  description: string;
  budget: string;
  requiredBy: string;
  isAccepted: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function CustomRequestsPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"available" | "accepted">(
    "available"
  );
  const [availableRequests, setAvailableRequests] = useState<CustomRequest[]>(
    []
  );
  const [acceptedRequests, setAcceptedRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/custom-request");
      if (response.data.success) {
        setAvailableRequests(response.data.availableRequests);
        setAcceptedRequests(response.data.acceptedRequests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("Failed to load custom requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setAccepting(requestId);
      const response = await api.put("/custom-request", { requestId });
      if (response.data.success) {
        alert("Request accepted successfully!");
        fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request. Please try again.");
    } finally {
      setAccepting(null);
    }
  };

  const filteredAvailableRequests = useMemo(() => {
    return availableRequests.filter(
      (request) =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableRequests, searchTerm]);

  const filteredAcceptedRequests = useMemo(() => {
    return acceptedRequests.filter(
      (request) =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [acceptedRequests, searchTerm]);

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
              Loading custom requests...
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
            Custom Order Management
          </h1>
          <p className="text-amber-700 font-baloo text-lg">
            Discover and manage your custom order opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={cn(craftStyles.card.warm, "p-6 text-center")}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              <MessageSquare className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900 font-baloo">
                  {availableRequests.length}
                </p>
                <p className="text-amber-700 font-baloo text-sm">
                  Available Requests
                </p>
              </div>
            </div>
          </div>

          <div className={cn(craftStyles.card.warm, "p-6 text-center")}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900 font-baloo">
                  {acceptedRequests.length}
                </p>
                <p className="text-amber-700 font-baloo text-sm">
                  Accepted Requests
                </p>
              </div>
            </div>
          </div>

          <div className={cn(craftStyles.card.warm, "p-6 text-center")}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900 font-baloo">
                  {acceptedRequests.length + availableRequests.length}
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
              placeholder="Search requests..."
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

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
            <button
              onClick={() => setActiveTab("available")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === "available"
                  ? "bg-white text-amber-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Available Requests
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === "accepted"
                  ? "bg-white text-amber-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              My Accepted Requests
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8 space-y-12">
        {activeTab === "available" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-900 font-baloo">
              Available Custom Requests
            </h2>
            {filteredAvailableRequests.length === 0 ? (
              <Card className={cn(craftStyles.card.warm, "p-12 text-center")}>
                <MessageSquare className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-amber-900 mb-2 font-baloo">
                  No Available Requests
                </h3>
                <p className="text-amber-700 font-baloo">
                  There are currently no custom requests available. Check back
                  later!
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredAvailableRequests.map((request) => (
                  <Card
                    key={request._id}
                    className={cn(craftStyles.card.warm, "p-6")}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={request.image}
                        alt={request.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-amber-900">
                            {request.title}
                          </h3>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Available
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">Type:</span>{" "}
                            {request.type}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">Budget:</span>{" "}
                            {request.budget}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">
                              Required by:
                            </span>{" "}
                            {new Date(request.requiredBy).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <p className="text-gray-700">{request.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Customer:</span>{" "}
                            {request.userId.name} ({request.userId.email})
                          </div>
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={accepting === request._id}
                            className={cn(craftStyles.button.primary)}
                          >
                            {accepting === request._id
                              ? "Accepting..."
                              : "Accept Request"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "accepted" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-900 font-baloo">
              My Accepted Custom Requests
            </h2>
            {filteredAcceptedRequests.length === 0 ? (
              <Card className={cn(craftStyles.card.warm, "p-12 text-center")}>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-amber-900 mb-2 font-baloo">
                  No Accepted Requests
                </h3>
                <p className="text-amber-700 font-baloo">
                  You haven't accepted any custom requests yet. Browse available
                  requests to get started!
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredAcceptedRequests.map((request) => (
                  <Card
                    key={request._id}
                    className={cn(
                      craftStyles.card.warm,
                      "p-6 border-green-200"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={request.image}
                        alt={request.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-green-900">
                            {request.title}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Accepted
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Type:</span>{" "}
                            {request.type}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Budget:</span>{" "}
                            {request.budget}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-medium">
                              Required by:
                            </span>{" "}
                            {new Date(request.requiredBy).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <p className="text-gray-700">{request.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Customer:</span>{" "}
                            {request.userId.name} ({request.userId.email})
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Accepted by you
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
