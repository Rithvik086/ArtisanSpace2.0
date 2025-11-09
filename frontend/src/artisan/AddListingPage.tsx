import React from 'react';
import { Link } from 'react-router-dom';

export default function AddListingPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-amber-900 mb-4">Add New Listing</h2>
        <p className="text-amber-700 mb-6">Use this page to add a new product listing. (Placeholder)</p>
        <div className="space-y-4">
          <input className="w-full border px-3 py-2 rounded" placeholder="Product name" />
          <input className="w-full border px-3 py-2 rounded" placeholder="Price" />
          <textarea className="w-full border px-3 py-2 rounded" placeholder="Description" />
          <div className="flex justify-end">
            <Link to="/artisan/listings" className="px-4 py-2 bg-amber-600 text-white rounded">Save (mock)</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
