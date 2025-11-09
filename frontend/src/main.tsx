// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignUp from "./components/auth/SignUp";
import Login from "./components/auth/Login";
import AdminDashboard from "./admin/AdminDashboardEntry";
import ListingsPage from "./artisan/listingspage";
import WorkshopsPage from "./artisan/Workshopspage";
import CustomRequestsPage from "./artisan/CustomRequestsPage";
import ArtisanDashboard from "./artisan/Dashboardpage";
import ArtisanLayout from "./artisan/ArtisanLayout";
import AddListingPage from "./artisan/AddListingPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin/*",
    element: <AdminDashboard />,
  },
  {
    path: "/artisan",
    element: <ArtisanLayout />,
    children: [
  { index: true, element: <ArtisanDashboard /> },
  { path: "add-listing", element: <AddListingPage /> },
  { path: "workshops", element: <WorkshopsPage /> },
  { path: "listings", element: <ListingsPage /> },
  { path: "customrequests", element: <CustomRequestsPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
