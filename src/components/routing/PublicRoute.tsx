import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (isAuthenticated) {
    const destination = role === "farmer" ? ROUTES.farmer.home : ROUTES.customer.home;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;