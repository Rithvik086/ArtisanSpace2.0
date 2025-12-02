import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Calendar,
  DollarSign,
  MessageSquare,
  Plus,
  List,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import api from "../../lib/axios";

interface CustomRequest {
  _id: string;
  title: string;
  type: string;
  image: string;
  description: string;
  budget: string;
  requiredBy: string;
  isAccepted: boolean;
  artisanId?: string;
  createdAt: string;
}

interface CustomRequest {
  _id: string;
  title: string;
  type: string;
  image: string;
  description: string;
  budget: string;
  requiredBy: string;
  isAccepted: boolean;
  artisanId?: string;
  createdAt: string;
}

export default function CustomOrderPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"form" | "requests">("form");
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    budget: "",
    requiredBy: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchUserRequests();
    }
  }, [activeTab]);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/custom-request/user");
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image");
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("budget", formData.budget);
      formDataToSend.append("requiredBy", formData.requiredBy);
      formDataToSend.append("image", image);

      const response = await api.post("/custom-request", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Custom order submitted successfully!");
        setFormData({
          title: "",
          type: "",
          description: "",
          budget: "",
          requiredBy: "",
        });
        setImage(null);
        setActiveTab("requests");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit custom order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (isAccepted: boolean) => {
    if (isAccepted) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Accepted
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-stone-100 font-baloo text-stone-800">
      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "form"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Plus size={18} />
              <span>Request Custom Order</span>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "requests"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <List size={18} />
              <span>My Requests</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Request Custom Order
                </CardTitle>
                <CardDescription>
                  Tell us about your custom craftsmanship needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Order Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Custom Wooden Table"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Craft Type
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="e.g., Furniture, Jewelry, Pottery"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your custom order in detail..."
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Budget
                      </label>
                      <input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="e.g., $500 - $1000"
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Required By
                      </label>
                      <input
                        type="date"
                        name="requiredBy"
                        value={formData.requiredBy}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Reference Image
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-md cursor-pointer hover:bg-stone-50"
                    >
                      <Upload className="w-4 h-4" />
                      {image ? image.name : "Choose Image"}
                    </label>
                    {image && (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-md mt-2"
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Custom Order"}
                  </button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-amber-900 font-medium">
                  Loading your requests...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
                <MessageSquare className="mx-auto h-16 w-16 text-amber-400 mb-4" />
                <h3 className="text-2xl font-baloo font-bold text-stone-800 mb-2">
                  No Custom Requests Yet
                </h3>
                <p className="text-stone-500 max-w-md mx-auto mb-8">
                  You haven't submitted any custom requests yet. Start by
                  requesting your first custom order!
                </p>
                <button
                  onClick={() => setActiveTab("form")}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Request Custom Order
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <h2 className="text-3xl font-bold text-amber-900 mb-6">
                    Pending Requests
                  </h2>
                  {requests.filter((r) => !r.isAccepted).length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-300">
                      <MessageSquare className="mx-auto h-12 w-12 text-amber-400 mb-4" />
                      <p className="text-stone-500">No pending requests.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {requests
                        .filter((r) => !r.isAccepted)
                        .map((request) => (
                          <Card
                            key={request._id}
                            className="bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-shadow"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-xl text-amber-900 mb-2">
                                    {request.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-4 text-sm text-stone-600">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4" />
                                      {request.budget}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(
                                        request.requiredBy
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                {getStatusBadge(request.isAccepted)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Description
                                  </h4>
                                  <p className="text-stone-700">
                                    {request.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <img
                                    src={request.image}
                                    alt={request.title}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                  <div className="text-sm text-stone-600">
                                    <p>Type: {request.type}</p>
                                    <p>
                                      Submitted:{" "}
                                      {new Date(
                                        request.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-amber-900 mb-6">
                    Accepted Requests
                  </h2>
                  {requests.filter((r) => r.isAccepted).length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-300">
                      <MessageSquare className="mx-auto h-12 w-12 text-green-400 mb-4" />
                      <p className="text-stone-500">
                        No accepted requests yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {requests
                        .filter((r) => r.isAccepted)
                        .map((request) => (
                          <Card
                            key={request._id}
                            className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-lg transition-shadow"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-xl text-green-900 mb-2">
                                    {request.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-4 text-sm text-stone-600">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4" />
                                      {request.budget}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(
                                        request.requiredBy
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                {getStatusBadge(request.isAccepted)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Description
                                  </h4>
                                  <p className="text-stone-700">
                                    {request.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <img
                                    src={request.image}
                                    alt={request.title}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                  <div className="text-sm text-stone-600">
                                    <p>Type: {request.type}</p>
                                    <p>
                                      Submitted:{" "}
                                      {new Date(
                                        request.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
