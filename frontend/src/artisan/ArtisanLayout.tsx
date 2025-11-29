import React from 'react';
import { Outlet } from 'react-router-dom';
import ArtisanNavbar from './ArtisanNavbar';
import CustomerFooter from '../components/customer/CustomerFooter';

export default function ArtisanLayout(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col">
      <ArtisanNavbar />
      <main >
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
