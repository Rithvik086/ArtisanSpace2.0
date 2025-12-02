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
import ToastProvider from "./components/ui/ToastProvider";
import { LoadingProvider } from "./components/ui/LoadingProvider";
import Loader from "./components/ui/Loader";

// Lazy load big components
const App = lazy(() => import("./App.tsx"));
const SignUp = lazy(() => import("./components/auth/SignUp"));
const Login = lazy(() => import("./components/auth/Login"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));
const ArtisanDashboard = lazy(() => import("./artisan/Dashboardpage"));
const WorkshopsPage = lazy(() => import("./artisan/Workshopspage"));
const ListingsPage = lazy(() => import("./artisan/listingspage"));
const DeliveryLayout = lazy(() => import("./delivery/DeliveryLayout"));
const DeliveryDashboard = lazy(() => import("./delivery/DeliveryDashboard"));
const SettingsPage = lazy(() => import("./SettingsPage"));
const ManagerApp = lazy(() => import("./manager/ManagerApp"));
const { AppProvider: ManagerAppProvider } = await import("./admin/AppContext");

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "manager", "artisan", "customer"]}
      >
        <SettingsPage />
      </ProtectedRoute>
    ),
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
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/customer",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "manager", "artisan", "customer"]}
      >
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: CustomerRoutes,
  },
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manager/*",
    element: (
      <ProtectedRoute allowedRoles={["admin", "manager"]}>
        <ManagerAppProvider>
          <ManagerApp />
        </ManagerAppProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/artisan",
    element: (
      <ProtectedRoute allowedRoles={["admin", "manager", "artisan"]}>
        <ArtisanLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ArtisanDashboard /> },
      // Removed 'add-listing' route. Use '/artisan/listings' instead.
      { path: "workshops", element: <WorkshopsPage /> },
      { path: "listings", element: <ListingsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "customrequests", element: <CustomRequestsPage /> },
    ],
  },
  {
    path: "/delivery",
    element: (
      <ProtectedRoute allowedRoles={["delivery", "admin"]}>
        <DeliveryLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DeliveryDashboard /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

const AppWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <LoadingProvider>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-screen">
              <Loader />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </ToastProvider>
    </LoadingProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppWrapper />
  </Provider>
);
