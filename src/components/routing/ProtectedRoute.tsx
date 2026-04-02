import { Navigate, Outlet, useLocation } from "react-router-dom";
import { type ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import type { AuthRole } from "@/services/auth.service";
import RouteLoadingScreen from "@/components/routing/RouteLoadingScreen";

interface ProtectedRouteProps {
  role?: AuthRole;
  children?: ReactNode;
}

const roleHomeMap: Record<AuthRole, string> = {
  farmer: ROUTES.farmer.home,
  customer: ROUTES.customer.home,
};

const roleLoginMap: Record<AuthRole, string> = {
  farmer: ROUTES.auth.farmerLogin,
  customer: ROUTES.auth.customerLogin,
};

const ProtectedRoute = ({ role, children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, role: currentRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  if (!isAuthenticated) {
    const fallbackLogin = role ? roleLoginMap[role] : ROUTES.getStarted;
    return <Navigate to={fallbackLogin} replace state={{ from: location }} />;
  }

  if (role && currentRole !== role) {
    const fallbackHome = currentRole ? roleHomeMap[currentRole] : ROUTES.root;
    return <Navigate to={fallbackHome} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
