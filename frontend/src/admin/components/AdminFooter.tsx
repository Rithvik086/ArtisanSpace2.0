import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminFooter(): React.ReactElement {
  return (
    <footer className="w-full border-t bg-white/90 backdrop-blur-sm py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-amber-900">
          © {new Date().getFullYear()} ArtisanSpace — All rights reserved.
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/admin/terms" className="text-amber-900 hover:underline">Terms</Link>
          <Link to="/admin/privacy" className="text-amber-900 hover:underline">Privacy</Link>
          <Link to="/admin/support" className="text-amber-900 hover:underline">Support</Link>
        </div>
      </div>
    </footer>
  );
}
