import React, { useState, useEffect } from 'react';
import { User, MapPin, Bell, CreditCard, Trash2, Save, Home, Briefcase, Plus } from 'lucide-react';

// --- Reusable Input Component ---
const InputField = ({ id, label, type = 'text', value, onChange, placeholder, icon: Icon }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative rounded-lg shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${Icon ? 'pl-10' : ''}`}
      />
    </div>
  </div>
);

// --- Reusable Button Component ---
const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '' }) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="h-5 w-5 mr-2 -ml-1" />}
      {children}
    </button>
  );
};

// --- Profile Settings Tab ---
const ProfileSettings = ({ formData, handleChange }) => (
  <div className="animate-fadeIn">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
    <form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="name"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
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
      <div className="mt-8 text-right">
        <Button variant="primary" icon={Save}>
          Update Profile
        </Button>
      </div>
    </form>
  </div>
);

// --- Address Settings Tab ---
const AddressSettings = ({ formData, handleChange }) => {
  const [addressType, setAddressType] = useState('home');
  
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Addresses</h2>
      
      {/* Address Type Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 max-w-xs">
        <button
          onClick={() => setAddressType('home')}
          className={`w-1/2 py-2 px-4 rounded-lg font-medium transition ${addressType === 'home' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          <Home className="h-5 w-5 inline mr-2" />
          Home
        </button>
        <button
          onClick={() => setAddressType('work')}
          className={`w-1/2 py-2 px-4 rounded-lg font-medium transition ${addressType === 'work' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          <Briefcase className="h-5 w-5 inline mr-2" />
          Work
        </button>
      </div>

      <form>
        {addressType === 'home' && (
          <div className="animate-fadeIn">
            <InputField
              id="homeStreet"
              label="Street Address (Home)"
              value={formData.homeStreet}
              onChange={handleChange}
              placeholder="123 Main St"
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
        )}
        
        {addressType === 'work' && (
           <div className="animate-fadeIn">
            <InputField
              id="workStreet"
              label="Street Address (Work)"
              value={formData.workStreet}
              onChange={handleChange}
              placeholder="456 Business Ave"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                id="workCity"
                label="City"
                value={formData.workCity}
                onChange={handleChange}
                placeholder="Metropolis"
              />
              <InputField
                id="workState"
                label="State / Province"
                value={formData.workState}
                onChange={handleChange}
                placeholder="NY"
              />
              <InputField
                id="workZip"
                label="Zip / Postal Code"
                value={formData.workZip}
                onChange={handleChange}
                placeholder="67890"
              />
            </div>
          </div>
        )}
        <div className="mt-8 text-right">
          <Button variant="primary" icon={Save}>
            Update {addressType === 'home' ? 'Home' : 'Work'} Address
          </Button>
        </div>
      </form>
    </div>
  );
};

// --- Notification Settings Tab ---
const NotificationSettings = ({ notifications, handleNotifChange }) => (
  <div className="animate-fadeIn">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Notification Preferences</h2>
    <p className="text-gray-600 mb-6">Choose how you'd like to be notified.</p>
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h3 className="font-medium text-gray-800">Email Notifications</h3>
          <p className="text-sm text-gray-500">Get order updates and newsletters via email.</p>
        </div>
        <input
          type="checkbox"
          checked={notifications.email}
          onChange={() => handleNotifChange('email')}
          className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h3 className="font-medium text-gray-800">SMS Notifications</h3>
          <p className="text-sm text-gray-500">Receive critical alerts and delivery updates via text.</p>
        </div>
        <input
          type="checkbox"
          checked={notifications.sms}
          onChange={() => handleNotifChange('sms')}
          className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h3 className="font-medium text-gray-800">Push Notifications</h3>
          <p className="text-sm text-gray-500">Get app notifications for flash sales and updates.</p>
        </div>
        <input
          type="checkbox"
          checked={notifications.push}
          onChange={() => handleNotifChange('push')}
          className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>
    </div>
    <div className="mt-8 text-right">
      <Button variant="primary" icon={Save}>
        Update Preferences
      </Button>
    </div>
  </div>
);

// --- Payment Settings Tab ---
const PaymentSettings = () => (
  <div className="animate-fadeIn">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Methods</h2>
    <div className="space-y-4">
      {/* Mocked Saved Card */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <img src="https://placehold.co/40x24/blue/white?text=VISA" alt="Visa" className="h-6 w-10 mr-4 rounded" />
          <div>
            <h3 className="font-medium text-gray-800">Visa ending in 1234</h3>
            <p className="text-sm text-gray-500">Expires 12/2026</p>
          </div>
        </div>
        <button className="text-sm font-medium text-red-600 hover:text-red-800">Remove</button>
      </div>
      
      {/* Mocked Saved Card */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <img src="https://placehold.co/40x24/orange/white?text=MC" alt="Mastercard" className="h-6 w-10 mr-4 rounded" />
          <div>
            <h3 className="font-medium text-gray-800">Mastercard ending in 5678</h3>
            <p className="text-sm text-gray-500">Expires 08/2025</p>
          </div>
        </div>
        <button className="text-sm font-medium text-red-600 hover:text-red-800">Remove</button>
      </div>
    </div>
    <div className="mt-8">
      <Button variant="secondary" icon={Plus}>
        Add New Payment Method
      </Button>
    </div>
  </div>
);

// --- Delete Account Section ---
const DeleteAccount = () => (
  <div className="mt-12 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
    <h2 className="text-2xl font-semibold text-red-800 mb-4">Delete Account</h2>
    <p className="text-red-700 mb-6">
      Once you delete your account, there is no going back. All your data, including order history and saved addresses, will be permanently removed. Please be certain.
    </p>
    <Button variant="danger" icon={Trash2}>
      Delete My Account
    </Button>
  </div>
);

// --- Tab Button Component ---
const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 py-3 px-4 font-medium text-sm md:text-base border-b-2 transition duration-150 ${
      isActive
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    mobile: '+1 (555) 123-4567',
    homeStreet: '123 Main St',
    homeCity: 'Anytown',
    homeState: 'CA',
    homeZip: '12345',
    workStreet: '',
    workCity: '',
    workState: '',
    workZip: '',
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  // Try to hydrate from backend demo endpoint if available. If backend isn't running
  // the fetch will fail and we keep the local defaults above so the page still renders.
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => {
        if (!res.ok) throw new Error('no settings');
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setFormData((prev) => ({
          ...prev,
          name: data.profile?.name ?? prev.name,
          username: data.profile?.username ?? prev.username,
          email: data.profile?.email ?? prev.email,
          mobile: data.profile?.mobile ?? prev.mobile,
          homeStreet: data.addresses?.[0]?.street ?? prev.homeStreet,
          homeCity: data.addresses?.[0]?.city ?? prev.homeCity,
          homeState: data.addresses?.[0]?.state ?? prev.homeState,
          homeZip: data.addresses?.[0]?.zip ?? prev.homeZip,
          workStreet: data.addresses?.[1]?.street ?? prev.workStreet,
          workCity: data.addresses?.[1]?.city ?? prev.workCity,
          workState: data.addresses?.[1]?.state ?? prev.workState,
          workZip: data.addresses?.[1]?.zip ?? prev.workZip,
        }));

        setNotifications((prev) => ({ ...prev, ...data.notifications }));
      })
      .catch(() => {
        // keep local defaults when backend is unavailable
      });
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };
  
  const handleNotifChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, component: <ProfileSettings formData={formData} handleChange={handleChange} /> },
    { id: 'address', label: 'Address', icon: MapPin, component: <AddressSettings formData={formData} handleChange={handleChange} /> },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: <NotificationSettings notifications={notifications} handleNotifChange={handleNotifChange} /> },
    { id: 'payment', label: 'Payment', icon: CreditCard, component: <PaymentSettings /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 font-inter">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* --- Sidebar Navigation --- */}
          <div className="w-full md:w-1/4 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
            <h1 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200">Settings</h1>
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full min-w-max md:min-w-full space-x-3 p-3 rounded-lg font-medium text-left transition ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* --- Content Area --- */}
          <div className="w-full md:w-3/4 p-6 md:p-10">
            {/* Render the active tab's component */}
            {tabs.find(tab => tab.id === activeTab)?.component}
            
            {/* Delete Account Section (only show on profile tab) */}
            {activeTab === 'profile' && <DeleteAccount />}
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        /* Import Inter font */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
