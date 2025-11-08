import React from 'react';
import { Outlet } from 'react-router-dom';
import ArtisanTabs from './ArtisanTabs';

export default function ArtisanLayout(): React.ReactElement {
  return (
    <div>
      <ArtisanTabs />
      <Outlet />
    </div>
  );
}
