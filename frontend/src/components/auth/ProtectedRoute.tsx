import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import Loader from "../ui/Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  if (isLoading) {
    // Show loading spinner or placeholder
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard based on role
    const dashboardRoutes: Record<string, string> = {
      admin: "/admin",
      manager: "/manager",
      artisan: "/artisan",
      customer: "/customer",
      delivery: "/delivery",
    };
    const redirectTo = dashboardRoutes[user.role] || "/";
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
