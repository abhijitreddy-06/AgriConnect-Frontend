import { Outlet } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

const FarmerLayout = () => (
  <div className="min-h-screen bg-background">
    <DashboardNavbar />
    <Outlet />
  </div>
);

export default FarmerLayout;
