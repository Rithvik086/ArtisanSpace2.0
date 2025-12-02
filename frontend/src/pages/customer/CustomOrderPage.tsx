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
import { useForm } from "react-hook-form";

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
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      title: "",
      type: "",
      description: "",
      budget: "",
      requiredBy: "",
    },
  });

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageError("");
    } else {
      setImage(null);
      setImageError("Reference image is required");
    }
  };

  const onSubmit = async (data: any) => {
    if (!image) {
      setImageError("Reference image is required");
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", data.title);
      formDataToSend.append("type", data.type);
      formDataToSend.append("description", data.description);
      formDataToSend.append("budget", data.budget);
      formDataToSend.append("requiredBy", data.requiredBy);
      formDataToSend.append("image", image);

      const response = await api.post("/custom-request", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Custom order submitted successfully!");
        reset();
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Order Title
                    </label>
                    <input
                      type="text"
                      {...register("title", {
                        required: "Order title is required",
                        minLength: {
                          value: 3,
                          message: "Title must be at least 3 characters",
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9\s\-']+$/,
                          message:
                            "Title can only contain letters, numbers, spaces, hyphens, and apostrophes",
                        },
                      })}
                      placeholder="e.g., Custom Wooden Table"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Craft Type
                    </label>
                    <input
                      type="text"
                      {...register("type", {
                        required: "Craft type is required",
                        minLength: {
                          value: 2,
                          message: "Type must be at least 2 characters",
                        },
                      })}
                      placeholder="e.g., Furniture, Jewelry, Pottery"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                    />
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.type.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message: "Description must be at least 10 characters",
                        },
                      })}
                      placeholder="Describe your custom order in detail..."
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Budget
                      </label>
                      <input
                        type="text"
                        {...register("budget", {
                          required: "Budget is required",
                          pattern: {
                            value: /^\$?\d+(\.\d{2})?$/,
                            message:
                              "Please enter a valid budget (e.g., $500 or 500)",
                          },
                        })}
                        placeholder="e.g., $500 - $1000"
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      />
                      {errors.budget && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.budget.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Required By
                      </label>
                      <input
                        type="date"
                        {...register("requiredBy", {
                          required: "Required by date is required",
                          validate: (value) => {
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return (
                              selectedDate >= today ||
                              "Date must be today or in the future"
                            );
                          },
                        })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      />
                      {errors.requiredBy && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.requiredBy.message}
                        </p>
                      )}
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
                    {imageError && (
                      <p className="text-red-500 text-sm mt-1">{imageError}</p>
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
