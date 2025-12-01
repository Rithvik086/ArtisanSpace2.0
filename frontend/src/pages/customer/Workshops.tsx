import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, MessageSquare, Plus, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { useToast } from "@/components/ui/ToastProvider";

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
  const [formData, setFormData] = useState({
    workshopTitle: "",
    workshopDesc: "",
    date: "",
    time: "",
  });
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();

  useEffect(() => {
    if (activeTab === "list" && user) {
      fetchWorkshops();
    }
  }, [activeTab, user]);

  const fetchWorkshops = async () => {
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
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.workshopTitle ||
      !formData.workshopDesc ||
      !formData.date ||
      !formData.time
    ) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      const response = await api.post("/workshop", formData);
      if (response.data.success) {
        showToast("Workshop booked successfully!", "success");
        setFormData({
          workshopTitle: "",
          workshopDesc: "",
          date: "",
          time: "",
        });
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Workshop Title
                    </label>
                    <input
                      type="text"
                      name="workshopTitle"
                      value={formData.workshopTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Pottery Making Basics"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="workshopDesc"
                      value={formData.workshopDesc}
                      onChange={handleInputChange}
                      placeholder="Describe what you'd like to learn or create..."
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
                      />
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
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-amber-900 mb-6">
                  Your Workshop Requests
                </h2>
                {workshops.map((workshop) => (
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
                              {new Date(workshop.date).toLocaleDateString()}
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
                        {workshop.status === 1 && workshop.artisanId && (
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
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Workshops;
