import React, { useState, useEffect } from 'react';
import { User, MapPin, Bell, CreditCard, Trash2, Save, Home, Briefcase, Plus } from 'lucide-react';
import { cn, craftStyles } from './styles/theme';

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

interface Notifications {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ElementType;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ElementType;
  className?: string;
}

interface ProfileSettingsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface AddressSettingsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface NotificationSettingsProps {
  notifications: Notifications;
  handleNotifChange: (key: keyof Notifications) => void;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

// --- Reusable Input Component ---
const InputField: React.FC<InputFieldProps> = ({ id, label, type = 'text', value, onChange, placeholder, icon: Icon }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-sm font-semibold text-amber-900 mb-2">
      {label}
    </label>
    <div className="relative rounded-lg shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          <Icon className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          craftStyles.input.default,
          Icon ? 'pl-10' : '',
          'focus:ring-amber-500 focus:border-amber-500'
        )}
      />
    </div>
  </div>
);

// --- Reusable Button Component ---
const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', icon: Icon, className = '' }) => {
  const craftVariants = {
    primary: craftStyles.button.primary,
    secondary: craftStyles.button.secondary,
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-red-600 rounded-lg px-4 py-2 font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(craftVariants[variant], className)}
    >
      {Icon && <Icon className="h-5 w-5 mr-2 -ml-1" />}
      {children}
    </button>
  );
};

// --- Profile Settings Tab ---
const ProfileSettings: React.FC<ProfileSettingsProps> = ({ formData, handleChange }) => (
  <div className="animate-fadeIn">
    <h2 className="text-3xl font-bold text-amber-900 mb-8 font-serif">Profile Information</h2>
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
const AddressSettings: React.FC<AddressSettingsProps> = ({ formData, handleChange }) => {
  const [addressType, setAddressType] = useState<'home' | 'work'>('home');
  
  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl font-bold text-amber-900 mb-8 font-serif">Manage Addresses</h2>
      
      {/* Address Type Toggle */}
      <div className="flex rounded-lg bg-amber-100 p-1 mb-8 max-w-xs border border-amber-300">
        <button
          onClick={() => setAddressType('home')}
          className={`w-1/2 py-3 px-4 rounded-lg font-semibold transition ${
            addressType === 'home' 
              ? 'bg-amber-600 text-white shadow-lg' 
              : 'text-amber-700 hover:bg-amber-200'
          }`}
        >
          <Home className="h-5 w-5 inline mr-2" />
          Home
        </button>
        <button
          onClick={() => setAddressType('work')}
          className={`w-1/2 py-3 px-4 rounded-lg font-semibold transition ${
            addressType === 'work' 
              ? 'bg-amber-600 text-white shadow-lg' 
              : 'text-amber-700 hover:bg-amber-200'
          }`}
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
const NotificationSettings: React.FC<NotificationSettingsProps> = ({ notifications, handleNotifChange }) => (
  <div className="animate-fadeIn">
    <h2 className="text-3xl font-bold text-amber-900 mb-8 font-serif">Notification Preferences</h2>
    <p className="text-amber-700 mb-8 text-lg">Choose how you'd like to be notified.</p>
    <div className="space-y-6">
      <div className={cn(craftStyles.card.default, "flex items-center justify-between p-6 border border-amber-200")}>
        <div>
          <h3 className="font-semibold text-amber-900 text-lg">Email Notifications</h3>
          <p className="text-amber-700 mt-1">Get order updates and newsletters via email.</p>
        </div>
        <input
          type="checkbox"
          checked={notifications.email}
          onChange={() => handleNotifChange('email')}
          className="h-6 w-6 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
        />
      </div>
      <div className={cn(craftStyles.card.default, "flex items-center justify-between p-6 border border-amber-200")}>
        <div>
          <h3 className="font-semibold text-amber-900 text-lg">SMS Notifications</h3>
          <p className="text-amber-700 mt-1">Receive critical alerts and delivery updates via text.</p>
        </div>
        <input
          type="checkbox"
          checked={notifications.sms}
          onChange={() => handleNotifChange('sms')}
          className="h-6 w-6 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
        />
      </div>
      <div className={cn(craftStyles.card.default, "flex items-center justify-between p-6 border border-amber-200")}>
        <div>
          <h3 className="font-semibold text-amber-900 text-lg">Push Notifications</h3>
          <p className="text-amber-700 mt-1">Get app notifications for flash sales and updates.</p>
        </div>
        <input
          type="checkbox"
          checked={notifications.push}
          onChange={() => handleNotifChange('push')}
          className="h-6 w-6 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
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
const PaymentSettings: React.FC = () => (
  <div className="animate-fadeIn">
    <h2 className="text-3xl font-bold text-amber-900 mb-8 font-serif">Payment Methods</h2>
    <div className="space-y-6">
      {/* Mocked Saved Card */}
      <div className={cn(craftStyles.card.default, "flex items-center justify-between p-6 border border-amber-200")}>
        <div className="flex items-center">
          <img src="https://placehold.co/40x24/blue/white?text=VISA" alt="Visa" className="h-6 w-10 mr-4 rounded" />
          <div>
            <h3 className="font-semibold text-amber-900">Visa ending in 1234</h3>
            <p className="text-amber-700">Expires 12/2026</p>
          </div>
        </div>
        <button className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
          Remove
        </button>
      </div>
      
      {/* Mocked Saved Card */}
      <div className={cn(craftStyles.card.default, "flex items-center justify-between p-6 border border-amber-200")}>
        <div className="flex items-center">
          <img src="https://placehold.co/40x24/orange/white?text=MC" alt="Mastercard" className="h-6 w-10 mr-4 rounded" />
          <div>
            <h3 className="font-semibold text-amber-900">Mastercard ending in 5678</h3>
            <p className="text-amber-700">Expires 08/2025</p>
          </div>
        </div>
        <button className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
          Remove
        </button>
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
const DeleteAccount: React.FC = () => (
  <div className="mt-12 p-8 bg-red-50 border-l-4 border-red-500 rounded-xl">
    <h2 className="text-2xl font-bold text-red-800 mb-4 font-serif">Delete Account</h2>
    <p className="text-red-700 mb-6 leading-relaxed">
      Once you delete your account, there is no going back. All your data, including order history and saved addresses, will be permanently removed. Please be certain.
    </p>
    <Button variant="danger" icon={Trash2} className="shadow-lg">
      Delete My Account
    </Button>
  </div>
);


// --- Main App Component ---
export default function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [formData, setFormData] = useState<FormData>({
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
  
  const [notifications, setNotifications] = useState<Notifications>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };
  
  const handleNotifChange = (key: keyof Notifications): void => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: User, component: <ProfileSettings formData={formData} handleChange={handleChange} /> },
    { id: 'address', label: 'Address', icon: MapPin, component: <AddressSettings formData={formData} handleChange={handleChange} /> },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: <NotificationSettings notifications={notifications} handleNotifChange={handleNotifChange} /> },
    { id: 'payment', label: 'Payment', icon: CreditCard, component: <PaymentSettings /> },
  ];

  return (
    <div className="bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 min-h-screen p-4 md:p-8">
      <div className={cn(craftStyles.card.warm, "max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200")}>
        <div className="md:flex">
          {/* --- Sidebar Navigation --- */}
          <div className="w-full md:w-1/4 bg-linear-to-b from-amber-100 to-orange-100 border-b md:border-b-0 md:border-r border-amber-300">
            <h1 className="text-2xl font-bold text-amber-900 p-6 border-b border-amber-300 font-serif">Settings</h1>
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-4 md:p-6 space-x-3 md:space-x-0 md:space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full min-w-max md:min-w-full space-x-3 p-4 rounded-lg font-semibold text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white shadow-lg border border-amber-700'
                      : 'text-amber-800 hover:bg-amber-200 hover:text-amber-900 border border-transparent'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* --- Content Area --- */}
          <div className="w-full md:w-3/4 p-8 md:p-12">
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}