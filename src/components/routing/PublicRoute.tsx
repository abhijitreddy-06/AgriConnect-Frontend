import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import RouteLoadingScreen from "@/components/routing/RouteLoadingScreen";

const PublicRoute = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  if (isAuthenticated) {
    const destination = role === "farmer" ? ROUTES.farmer.home : ROUTES.customer.home;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;