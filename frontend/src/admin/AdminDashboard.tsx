import React from 'react';
import { AppProvider } from './AppContext';
import AdminApp from './AdminApp';

export default function AdminDashboard(): React.ReactElement {
  return (
    <AppProvider>
      <AdminApp />
    </AppProvider>
  );
}