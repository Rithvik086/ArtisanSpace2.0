import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, MessageSquare, Plus, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { useToast } from "@/components/ui/ToastProvider";
import { useForm } from "react-hook-form";

interface Workshop {
  _id: string;
  workshopTitle: string;
  workshopDescription: string;
  date: string;
  time: string;
  status: number; // 0 pending, 1 accepted
  artisanId?: {
    username: string;
    email?: string;
    mobile_no?: string;
  };
  acceptedAt?: string;
}

const Workshops: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"book" | "list">("book");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      workshopTitle: "",
      workshopDesc: "",
      date: "",
      time: "",
    },
  });

  const fetchWorkshops = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get(`/workshop/user/${user.id}`);
      if (response.data.success) {
        setWorkshops(response.data.workshops);
      }
    } catch (error) {
      console.error("Error fetching workshops:", error);
      showToast("Failed to load workshops", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (activeTab === "list" && user) {
      fetchWorkshops();
    }
  }, [activeTab, user, fetchWorkshops]);

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post("/workshop", data);
      if (response.data.success) {
        showToast("Workshop booked successfully!", "success");
        reset();
        setActiveTab("list");
      } else {
        showToast(response.data.message || "Failed to book workshop", "error");
      }
    } catch (error) {
      console.error("Error booking workshop:", error);
      showToast("Failed to book workshop", "error");
    }
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
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
              onClick={() => setActiveTab("book")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "book"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Plus size={18} />
              <span>Book Workshop</span>
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <List size={18} />
              <span>My Workshops</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "book" && (
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
                  Request a Workshop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Workshop Title
                    </label>
                    <input
                      type="text"
                      {...register("workshopTitle", {
                        required: "Workshop title is required",
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
                      placeholder="e.g., Pottery Making Basics"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                    />
                    {errors.workshopTitle && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.workshopTitle.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register("workshopDesc", {
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message: "Description must be at least 10 characters",
                        },
                      })}
                      placeholder="Describe what you'd like to learn or create..."
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                    />
                    {errors.workshopDesc && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.workshopDesc.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        {...register("date", {
                          required: "Date is required",
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
                      {errors.date && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        {...register("time", { required: "Time is required" })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      />
                      {errors.time && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.time.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                  >
                    Submit Workshop Request
                  </button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "list" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-amber-900 font-medium">
                  Loading your workshops...
                </p>
              </div>
            ) : workshops.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
                <User className="mx-auto h-16 w-16 text-amber-400 mb-4" />
                <h3 className="text-2xl font-baloo font-bold text-stone-800 mb-2">
                  No Workshops Yet
                </h3>
                <p className="text-stone-500 max-w-md mx-auto mb-8">
                  You haven't requested any workshops yet. Start by booking your
                  first workshop!
                </p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Book a Workshop
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <h2 className="text-3xl font-bold text-amber-900 mb-6">
                    Pending Workshop Requests
                  </h2>
                  {workshops.filter((w) => w.status === 0).length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-300">
                      <User className="mx-auto h-12 w-12 text-amber-400 mb-4" />
                      <p className="text-stone-500">
                        No pending workshop requests.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {workshops
                        .filter((w) => w.status === 0)
                        .map((workshop) => (
                          <Card
                            key={workshop._id}
                            className="bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-shadow"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-xl text-amber-900 mb-2">
                                    {workshop.workshopTitle}
                                  </CardTitle>
                                  <div className="flex items-center gap-4 text-sm text-stone-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(
                                        workshop.date
                                      ).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {workshop.time}
                                    </div>
                                  </div>
                                </div>
                                {getStatusBadge(workshop.status)}
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
                                    {workshop.workshopDescription}
                                  </p>
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
                    Accepted Workshops
                  </h2>
                  {workshops.filter((w) => w.status === 1).length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-300">
                      <User className="mx-auto h-12 w-12 text-green-400 mb-4" />
                      <p className="text-stone-500">
                        No accepted workshops yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {workshops
                        .filter((w) => w.status === 1)
                        .map((workshop) => (
                          <Card
                            key={workshop._id}
                            className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-lg transition-shadow"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-xl text-green-900 mb-2">
                                    {workshop.workshopTitle}
                                  </CardTitle>
                                  <div className="flex items-center gap-4 text-sm text-stone-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(
                                        workshop.date
                                      ).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {workshop.time}
                                    </div>
                                  </div>
                                </div>
                                {getStatusBadge(workshop.status)}
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
                                    {workshop.workshopDescription}
                                  </p>
                                </div>
                                {workshop.artisanId && (
                                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h4 className="font-semibold text-green-900 mb-2">
                                      Accepted by Artisan
                                    </h4>
                                    <p className="text-green-800">
                                      Artisan: {workshop.artisanId.username}
                                    </p>
                                    {workshop.artisanId.email && (
                                      <p className="text-green-800">
                                        Email: {workshop.artisanId.email}
                                      </p>
                                    )}
                                    {workshop.artisanId.mobile_no && (
                                      <p className="text-green-800">
                                        Phone: {workshop.artisanId.mobile_no}
                                      </p>
                                    )}
                                    {workshop.acceptedAt && (
                                      <p className="text-green-800 text-sm">
                                        Accepted on:{" "}
                                        {new Date(
                                          workshop.acceptedAt
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                )}
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
};

export default Workshops;
