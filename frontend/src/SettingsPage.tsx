import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Trash2,
  Save,
  Home,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "./styles/theme";
import api from "./lib/axios";

// TypeScript interfaces
interface FormData {
  name: string;
  username: string;
  email: string;
  mobile: string;
  homeStreet: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  workStreet: string;
  workCity: string;
  workState: string;
  workZip: string;
}

interface ApiResponse {
  profile: {
    name: string;
    username: string;
    email: string;
    mobile: string;
  };
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    zip: string;
  }>;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ElementType;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

interface ProfileSettingsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface AddressSettingsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

// --- Reusable Input Component ---
const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="mb-6 group">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-amber-900 mb-2 transition-colors group-focus-within:text-amber-700"
      >
        {label}
      </label>
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Icon
              className="h-5 w-5 text-amber-600 transition-colors group-focus-within:text-amber-700"
              aria-hidden="true"
            />
          </div>
        )}
        <input
          type={inputType}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 border border-amber-200 rounded-lg",
            "focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
            "bg-white/80 backdrop-blur-sm text-amber-900 placeholder-amber-500",
            "transition-all duration-200 hover:border-amber-300",
            "shadow-sm hover:shadow-md focus:shadow-lg",
            Icon ? "pl-10" : "",
            type === "password" ? "pr-10" : "",
            disabled && "bg-gray-100 text-gray-500 cursor-not-allowed"
          )}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-amber-600 hover:text-amber-700" />
            ) : (
              <Eye className="h-5 w-5 text-amber-600 hover:text-amber-700" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Reusable Button Component ---
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  icon: Icon,
  className = "",
  type = "button",
  disabled = false,
}) => {
  const craftVariants = {
    primary: cn(
      "bg-gradient-to-r from-amber-600 to-amber-700",
      "hover:from-amber-700 hover:to-amber-800",
      "text-white font-semibold px-6 py-3 rounded-lg",
      "shadow-md hover:shadow-xl transition-all duration-300",
      "border border-amber-600 hover:border-amber-700",
      "transform hover:-translate-y-0.5 active:translate-y-0",
      "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
    ),
    secondary: cn(
      "bg-white/90 backdrop-blur-sm border-2 border-amber-600 text-amber-700",
      "hover:bg-amber-50 hover:border-amber-700 font-semibold px-6 py-3 rounded-lg",
      "shadow-sm hover:shadow-lg transition-all duration-300",
      "transform hover:-translate-y-0.5 active:translate-y-0",
      "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
    ),
    danger: cn(
      "bg-gradient-to-r from-red-600 to-red-700",
      "hover:from-red-700 hover:to-red-800",
      "text-white font-semibold px-6 py-3 rounded-lg",
      "shadow-md hover:shadow-xl transition-all duration-300",
      "border border-red-600 hover:border-red-700",
      "transform hover:-translate-y-0.5 active:translate-y-0",
      "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    ),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        craftVariants[variant],
        className,
        "group flex items-center justify-center",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {Icon && (
        <Icon className="h-5 w-5 mr-2 -ml-1 transition-transform group-hover:scale-110 shrink-0" />
      )}
      {children}
    </button>
  );
};

// --- Profile Settings Tab ---
const ProfileSettings: React.FC<
  ProfileSettingsProps & {
    onSave: () => Promise<void>;
    isLoading: boolean;
    onReset: () => void;
  }
> = ({ formData, handleChange, onSave, isLoading, onReset }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <div className="animate-fadeIn min-h-[500px] flex flex-col">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-linear-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h2
              className="text-3xl font-bold text-amber-900"
              style={{ fontFamily: "Baloo Bhai 2, cursive" }}
            >
              Profile Information
            </h2>
            <p className="text-amber-700 mt-1">
              Manage your personal details and preferences
            </p>
          </div>
        </div>
      </div>

      <form className="grow" onSubmit={handleSubmit}>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-200 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-6 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              icon={User}
            />
            <InputField
              id="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
            />
            <InputField
              id="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={true}
            />
            <InputField
              id="mobile"
              label="Mobile Number"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            className="px-8"
            onClick={onReset}
            type="button"
            disabled={isLoading}
          >
            Reset Changes
          </Button>
          <Button
            variant="primary"
            icon={isLoading ? Loader : Save}
            className="px-8"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// --- Address Settings Tab ---
const AddressSettings: React.FC<
  AddressSettingsProps & {
    onSave: () => Promise<void>;
    isLoading: boolean;
    onReset: () => void;
  }
> = ({ formData, handleChange, onSave, isLoading, onReset }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <div className="animate-fadeIn min-h-[500px] flex flex-col">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-linear-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h2
              className="text-3xl font-bold text-amber-900"
              style={{ fontFamily: "Baloo Bhai 2, cursive" }}
            >
              Manage Addresses
            </h2>
            <p className="text-amber-700 mt-1">
              Update your delivery and billing addresses
            </p>
          </div>
        </div>
      </div>

      {/* Note about single address */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800 text-sm">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          Currently, only one primary address is supported. You can update your
          main address below.
        </p>
      </div>

      <form className="grow" onSubmit={handleSubmit}>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-200 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-6 flex items-center">
            <Home className="h-5 w-5 mr-2 text-amber-600" />
            Primary Address
          </h3>

          <div className="animate-fadeIn space-y-6">
            <InputField
              id="homeStreet"
              label="Street Address"
              value={formData.homeStreet}
              onChange={handleChange}
              placeholder="123 Main St"
              icon={MapPin}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                id="homeCity"
                label="City"
                value={formData.homeCity}
                onChange={handleChange}
                placeholder="Anytown"
              />
              <InputField
                id="homeState"
                label="State / Province"
                value={formData.homeState}
                onChange={handleChange}
                placeholder="CA"
              />
              <InputField
                id="homeZip"
                label="Zip / Postal Code"
                value={formData.homeZip}
                onChange={handleChange}
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            className="px-8"
            onClick={onReset}
            type="button"
            disabled={isLoading}
          >
            Reset Changes
          </Button>
          <Button
            variant="primary"
            icon={isLoading ? Loader : Save}
            className="px-8"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Address"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Notification settings removed per request

// Payment settings removed per request

// --- Delete Account Section ---
const DeleteAccount: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="mt-12 p-8 bg-linear-to-br from-red-50 to-red-100 border border-red-300 rounded-2xl shadow-lg">
      <div className="flex items-start mb-6">
        <div className="h-12 w-12 bg-linear-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg shrink-0">
          <Trash2 className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h2
            className="text-2xl font-bold text-red-800 mb-2"
            style={{ fontFamily: "Baloo Bhai 2, cursive" }}
          >
            Danger Zone
          </h2>
          <p className="text-red-700 leading-relaxed">
            Once you delete your account, there is no going back. All your data,
            including order history and saved addresses, will be permanently
            removed. Please be certain before proceeding.
          </p>
        </div>
      </div>

      {!showConfirmation ? (
        <Button
          variant="danger"
          icon={Trash2}
          className="shadow-lg"
          onClick={() => setShowConfirmation(true)}
        >
          Delete My Account
        </Button>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-red-300">
          <p className="text-red-800 font-semibold mb-4">
            Are you absolutely sure? This action cannot be undone.
          </p>
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2}>
              Yes, Delete My Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    mobile: "",
    homeStreet: "",
    homeCity: "",
    homeState: "",
    homeZip: "",
    workStreet: "",
    workCity: "",
    workState: "",
    workZip: "",
  });

  const [originalData, setOriginalData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    mobile: "",
    homeStreet: "",
    homeCity: "",
    homeState: "",
    homeZip: "",
    workStreet: "",
    workCity: "",
    workState: "",
    workZip: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch user settings from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/settings");
        const data: ApiResponse = response.data;

        const userData: FormData = {
          name: data.profile?.name || "",
          username: data.profile?.username || "",
          email: data.profile?.email || "",
          mobile: data.profile?.mobile || "",
          homeStreet: data.addresses?.[0]?.street || "",
          homeCity: data.addresses?.[0]?.city || "",
          homeState: data.addresses?.[0]?.state || "",
          homeZip: data.addresses?.[0]?.zip || "",
          workStreet: data.addresses?.[1]?.street || "",
          workCity: data.addresses?.[1]?.city || "",
          workState: data.addresses?.[1]?.state || "",
          workZip: data.addresses?.[1]?.zip || "",
        };

        setFormData(userData);
        setOriginalData(userData);
        setMessage(null);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({
          type: "error",
          text: "Failed to load user data. Please refresh the page.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    // Clear any existing messages when user starts typing
    if (message) setMessage(null);
  };

  const handleSaveProfile = async (): Promise<void> => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Prepare data for API call
      const updateData = {
        name: formData.name.trim(),
        mobile_no: formData.mobile.trim(),
        address: {
          street: formData.homeStreet.trim(),
          city: formData.homeCity.trim(),
          state: formData.homeState.trim(),
          zip: formData.homeZip.trim(),
        },
      };

      await api.post("/auth/update-profile", updateData);

      // Update original data to reflect saved changes
      setOriginalData({ ...formData });
      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      let errorMessage = "Failed to update profile. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (): void => {
    setFormData({ ...originalData });
    setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-amber-800 text-lg">Loading your settings...</p>
        </div>
      </div>
    );
  }

  const tabs: Tab[] = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      component: (
        <ProfileSettings
          formData={formData}
          handleChange={handleChange}
          onSave={handleSaveProfile}
          isLoading={isSaving}
          onReset={handleReset}
        />
      ),
    },
    {
      id: "address",
      label: "Address",
      icon: MapPin,
      component: (
        <AddressSettings
          formData={formData}
          handleChange={handleChange}
          onSave={handleSaveProfile}
          isLoading={isSaving}
          onReset={handleReset}
        />
      ),
    },
    // Notifications and Payment tabs removed per request
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-amber-900 mb-4"
            style={{ fontFamily: "Baloo Bhai 2, cursive" }}
          >
            Account Settings
          </h1>
          <p className="text-amber-700 text-lg max-w-2xl mx-auto">
            Manage your personal information, addresses, and account preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div
            className={cn(
              "mb-6 p-4 rounded-xl shadow-lg flex items-center animate-fadeIn",
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            )}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-200">
          <div className="md:flex min-h-[700px]">
            {/* --- Sidebar Navigation --- */}
            <div className="w-full md:w-1/4 bg-linear-to-b from-amber-100/90 to-orange-100/90 backdrop-blur-sm border-b md:border-b-0 md:border-r border-amber-300">
              <div className="p-6 border-b border-amber-300">
                <h2
                  className="text-xl font-bold text-amber-900 flex items-center"
                  style={{ fontFamily: "Baloo Bhai 2, cursive" }}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Navigation
                </h2>
              </div>
              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-4 md:p-6 space-x-3 md:space-x-0 md:space-y-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center w-full min-w-max md:min-w-full space-x-3 p-4 rounded-xl font-semibold text-left",
                      "transition-all duration-300 group",
                      activeTab === tab.id
                        ? "bg-linear-to-r from-amber-700 to-amber-800 text-white shadow-lg transform scale-105 border border-amber-800"
                        : "text-amber-800 hover:bg-amber-200/80 hover:text-amber-900 border border-transparent hover:scale-102"
                    )}
                  >
                    <tab.icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        activeTab === tab.id
                          ? "scale-110"
                          : "group-hover:scale-110"
                      )}
                    />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* --- Content Area --- */}
            <div className="w-full md:w-3/4 p-8 md:p-12 min-h-[600px] flex flex-col bg-linear-to-br from-white/60 to-amber-50/60 backdrop-blur-sm">
              {/* Render the active tab's component */}
              <div className="grow">
                {tabs.find((tab) => tab.id === activeTab)?.component}
              </div>

              {/* Delete Account Section (only show on profile tab) */}
              {activeTab === "profile" && <DeleteAccount />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
