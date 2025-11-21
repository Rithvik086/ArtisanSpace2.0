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
import CustomerRoutes from "../routes/CustomerRoutes.js";
import { Provider } from "react-redux";
import { store } from "./redux/store";

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
]);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
