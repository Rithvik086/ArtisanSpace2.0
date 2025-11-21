// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useEffect, lazy, Suspense } from "react";
import { useDispatch } from "react-redux";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CustomerRoutes } from "../routes/CustomerRoutes";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import type { AppDispatch } from "./redux/store";
import { fetchUser } from "./redux/slices/authThunks";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomerLayout from "./components/customer/CustomerLayout";
import AdminDashboard from "./admin/AdminDashboardEntry";
import CustomRequestsPage from "./artisan/CustomRequestsPage";
import ArtisanLayout from "./artisan/ArtisanLayout";

// Lazy load big components
const App = lazy(() => import('./App.tsx'));
const SignUp = lazy(() => import('./components/auth/SignUp'));
const Login = lazy(() => import('./components/auth/Login'));
const ArtisanDashboard = lazy(() => import('./artisan/Dashboardpage'));
const WorkshopsPage = lazy(() => import('./artisan/Workshopspage'));
const ListingsPage = lazy(() => import('./artisan/listingspage'));

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
    element: (
      <ProtectedRoute allowedRoles={['admin', 'manager', 'artisan', 'customer']}>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: CustomerRoutes,
  },
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manager",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'manager']}>
        <div>Manager Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/artisan",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'manager', 'artisan']}>
        <ArtisanLayout />
      </ProtectedRoute>
    ),
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
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppWrapper />
  </Provider>
);
