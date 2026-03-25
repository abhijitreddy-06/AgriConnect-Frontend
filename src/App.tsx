import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { ROUTES } from "@/config/routes";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import PublicRoute from "@/components/routing/PublicRoute";
import FarmerLayout from "@/layouts/FarmerLayout";
import CustomerLayout from "@/layouts/CustomerLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Index from "./pages/Index.tsx";
import GetStarted from "./pages/GetStarted.tsx";
import FarmerLogin from "@/pages/auth/FarmerLogin";
import FarmerSignup from "@/pages/auth/FarmerSignup";
import CustomerLogin from "@/pages/auth/CustomerLogin";
import CustomerSignup from "@/pages/auth/CustomerSignup";
import FarmerDashboard from "@/pages/farmer/Dashboard";
import FarmerSell from "@/pages/farmer/Sell";
import FarmerMarket from "@/pages/farmer/Market";
import FarmerMyProducts from "@/pages/farmer/MyProducts";
import FarmerProfile from "@/pages/farmer/Profile";
import FarmerOrders from "@/pages/farmer/Orders";
import FarmerDiagnosis from "@/pages/farmer/Diagnosis";
import ProductDetail from "./pages/ProductDetail.tsx";
import CustomerHome from "@/pages/customer/Home";
import CustomerMarket from "@/pages/customer/Market";
import CustomerProductDetail from "@/pages/customer/ProductDetail";
import CustomerWishlist from "@/pages/customer/Wishlist";
import CustomerArticles from "@/pages/customer/Articles";
import CustomerProfile from "@/pages/customer/Profile";
import CustomerCart from "@/pages/customer/Cart";
import CustomerOrders from "@/pages/customer/Orders";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path={ROUTES.root} element={<Index />} />
                <Route path={ROUTES.getStarted} element={<GetStarted />} />

                <Route element={<AuthLayout />}>
                  <Route path={ROUTES.auth.farmerLogin} element={<FarmerLogin />} />
                  <Route path={ROUTES.auth.farmerSignup} element={<FarmerSignup />} />
                  <Route path={ROUTES.auth.customerLogin} element={<CustomerLogin />} />
                  <Route path={ROUTES.auth.customerSignup} element={<CustomerSignup />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute role="farmer" />}>
                <Route element={<FarmerLayout />}>
                  <Route path={ROUTES.farmer.home} element={<FarmerDashboard />} />
                  <Route path={ROUTES.farmer.sell} element={<FarmerSell />} />
                  <Route path={ROUTES.farmer.market} element={<FarmerMarket />} />
                  <Route path={`${ROUTES.farmer.market}/:productId`} element={<ProductDetail />} />
                  <Route path={ROUTES.farmer.myProducts} element={<FarmerMyProducts />} />
                  <Route path={ROUTES.farmer.orders} element={<FarmerOrders />} />
                  <Route path={ROUTES.farmer.diagnosis} element={<FarmerDiagnosis />} />
                  <Route path={ROUTES.farmer.profile} element={<FarmerProfile />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute role="customer" />}>
                <Route element={<CustomerLayout />}>
                  <Route path={ROUTES.customer.home} element={<CustomerHome />} />
                  <Route path="/doctor/home" element={<Navigate to={ROUTES.customer.home} replace />} />
                  <Route path={ROUTES.customer.market} element={<CustomerMarket />} />
                  <Route path={ROUTES.customer.productDetail} element={<CustomerProductDetail />} />
                  <Route path={ROUTES.customer.wishlist} element={<CustomerWishlist />} />
                  <Route path={ROUTES.customer.articles} element={<CustomerArticles />} />
                  <Route path={ROUTES.customer.profile} element={<CustomerProfile />} />
                  <Route path={ROUTES.customer.cart} element={<CustomerCart />} />
                  <Route path={ROUTES.customer.orders} element={<CustomerOrders />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
