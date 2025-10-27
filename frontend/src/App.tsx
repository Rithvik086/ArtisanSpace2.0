import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import AdminDashboard from './admin/AdminDashboard.jsx';
// @ts-ignore
import SettingsPage from './SettingsPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
