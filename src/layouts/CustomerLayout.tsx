import { Outlet } from "react-router-dom";
import CustomerNavbar from "@/components/dashboard/CustomerNavbar";

const CustomerLayout = () => (
  <div className="customer-theme customer-shell-bg min-h-screen bg-background">
    <CustomerNavbar />
    <Outlet />
  </div>
);

export default CustomerLayout;
