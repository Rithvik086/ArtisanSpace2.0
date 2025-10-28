import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import SettingsPage from './SettingsPage';
import Dashboardpage from './artisan/Dashboardpage';
import AddListingPage from './artisan/listingspage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/artisan" element={<Dashboardpage />} />
        <Route path="/artisan/add-listing" element={<AddListingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
