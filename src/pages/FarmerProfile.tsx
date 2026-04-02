import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  User, Phone, Package, ShoppingCart, IndianRupee,
  ArrowRight, LogOut, Pencil, Leaf, MapPin, LocateFixed
} from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import { locationService } from "@/services/location.service";
import { toast } from "sonner";

const quickLinks = [
  { label: "My Products", path: ROUTES.farmer.myProducts, icon: Package },
  { label: "View Orders", path: ROUTES.farmer.orders, icon: ShoppingCart },
  { label: "Add Product", path: ROUTES.farmer.sell, icon: ArrowRight },
];

const FarmerProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.username || "");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.deliveryAddress || "");
  const fullNameFieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isEditing) return;
    fullNameFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isEditing]);

  const { data: productData } = useQuery({
    queryKey: ["farmer-profile-products", user?.id],
    queryFn: () => productService.list({ farmer_id: user?.id, limit: 100 }),
    enabled: Boolean(user?.id),
  });

  const { data: orderData } = useQuery({
    queryKey: ["farmer-profile-orders"],
    queryFn: () => orderService.list({ page: 1, limit: 100 }),
  });

  const saveProfileMutation = useMutation({
    mutationFn: () => updateProfile({
      username: fullName.trim(),
      delivery_address: deliveryAddress.trim() ? deliveryAddress.trim() : null,
    }),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error && error.message ? error.message : "Failed to update profile";
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      toast.success("Logged out successfully");
      navigate(ROUTES.root, { replace: true });
    },
    onError: () => {
      navigate(ROUTES.root, { replace: true });
    },
  });

  const locateMutation = useMutation({
    mutationFn: () => locationService.getCurrentLocationAddress(),
    onSuccess: (resolved) => {
      setDeliveryAddress(resolved.address);
      toast.success("Address detected from current location");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to detect location");
    },
  });

  const products = productData?.products ?? [];
  const orders = orderData?.orders ?? [];
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const totalRevenue = orders
    .filter((order) => ["accepted", "shipped", "delivered"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total_price ?? 0), 0);

  const activityStats = [
    { icon: Package, label: "Total Products", value: String(products.length), color: "text-primary" },
    { icon: ShoppingCart, label: "Orders Completed", value: String(deliveredOrders), color: "text-accent" },
    { icon: IndianRupee, label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account details</p>
          </motion.div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center text-center h-fit lg:sticky lg:top-28"
            >
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edit profile</TooltipContent>
                </Tooltip>
              </div>

              <h2 className="font-display font-bold text-xl text-foreground">{user?.username || "Farmer"}</h2>
              <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                <Leaf className="h-3 w-3 mr-1" /> Farmer
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">Phone: {user?.phone || "-"}</p>
              <p className="text-xs text-muted-foreground mt-2">Address: {user?.deliveryAddress || "Not set"}</p>

              <div className="w-full mt-6 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive dark:text-red-300 font-semibold hover:text-destructive dark:hover:text-red-200 hover:bg-destructive/10"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border shadow-sm p-6"
              >
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="rounded-lg bg-secondary p-2.5">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="text-sm font-medium text-foreground">{user?.username || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="rounded-lg bg-secondary p-2.5">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">{user?.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 sm:col-span-2">
                    <div className="rounded-lg bg-secondary p-2.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium text-foreground break-words">{user?.deliveryAddress || "Not set"}</p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                    <div ref={fullNameFieldRef} className="space-y-2 scroll-mt-28">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Address</Label>
                      <Input
                        id="deliveryAddress"
                        value={deliveryAddress}
                        onChange={(event) => setDeliveryAddress(event.target.value)}
                        placeholder="Enter your address"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => locateMutation.mutate()}
                      disabled={locateMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      <LocateFixed className="h-4 w-4 mr-2" />
                      {locateMutation.isPending ? "Detecting..." : "Use Current Location"}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (!fullName.trim()) {
                            toast.error("Full name is required");
                            return;
                          }
                          saveProfileMutation.mutate();
                        }}
                        disabled={saveProfileMutation.isPending}
                      >
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setFullName(user?.username || "");
                        setIsEditing(false);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border border-border shadow-sm p-6"
              >
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Activity Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activityStats.map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/40">
                      <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                      <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl border border-border shadow-sm p-6"
              >
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {quickLinks.map((link) => (
                    <Button key={link.path} variant="outline" className="justify-start gap-2 h-12" asChild>
                      <Link to={link.path}>
                        <link.icon className="h-4 w-4 text-primary" />
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FarmerProfile;
