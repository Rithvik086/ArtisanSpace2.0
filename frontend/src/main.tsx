// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
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
import { CustomerRoutes } from "../routes/CustomerRoutes";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { fetchUser } from "./redux/slices/authThunks";

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
    path: "/customer",
    children: CustomerRoutes,
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
      // Removed 'add-listing' route. Use '/artisan/listings' instead.
      { path: "workshops", element: <WorkshopsPage /> },
      { path: "listings", element: <ListingsPage /> },
      { path: "customrequests", element: <CustomRequestsPage /> },
    ],
  },
]);

const AppWrapper = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppWrapper />
  </Provider>
);
