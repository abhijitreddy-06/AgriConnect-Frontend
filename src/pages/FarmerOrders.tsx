import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck, Clock3, Truck, CircleCheckBig, Ban, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/landing/Footer";
import { orderService } from "@/services/order.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  accepted: { label: "Accepted", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  shipped: { label: "Shipped", className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  delivered: { label: "Delivered", className: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const FarmerOrders = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["farmer-orders"],
    queryFn: () => orderService.list({ page: 1, limit: 100 }),
  });

  const orders = data?.orders ?? [];

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "pending").length;
    const shipped = orders.filter((order) => order.status === "shipped").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;
    return {
      total: orders.length,
      pending,
      shipped,
      delivered,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="pt-24 pb-16 flex-1">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">Order Requests</h1>
            <p className="text-muted-foreground mt-1">Track customer orders and their current status.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-border bg-card p-4">
              <PackageCheck className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-display font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <Clock3 className="h-5 w-5 text-amber-600 mb-2" />
              <p className="text-2xl font-display font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <Truck className="h-5 w-5 text-indigo-600 mb-2" />
              <p className="text-2xl font-display font-bold">{stats.shipped}</p>
              <p className="text-xs text-muted-foreground">Shipped</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <CircleCheckBig className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-display font-bold">{stats.delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <span className="col-span-3">Product</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-3">Customer</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2 text-right">Chat</span>
            </div>

            {isLoading && <p className="px-4 py-8 text-sm text-muted-foreground">Loading orders...</p>}

            {!isLoading && orders.length === 0 && (
              <div className="px-4 py-10 text-center text-muted-foreground">
                <Ban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No orders yet.
              </div>
            )}

            {orders.map((order) => {
              const status = statusMap[order.status] ?? {
                label: order.status,
                className: "bg-muted text-muted-foreground border-border",
              };

              return (
                <div key={order.id} className="border-b last:border-b-0 border-border px-4 py-3">
                  <div className="md:hidden space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Product</span>
                      <span className="font-medium text-foreground text-right max-w-[65%] truncate">{order.product_name || "Product"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Qty</span>
                      <span className="text-foreground">{order.quantity}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="text-foreground text-right max-w-[60%] truncate">{order.username || "Customer"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className={`${status.className} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {order.status !== "cancelled" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => navigate(`${ROUTES.farmer.chats}/${order.id}`)}
                          >
                            <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-12 gap-2 text-sm items-center">
                    <span className="col-span-3 font-medium text-foreground truncate">{order.product_name || "Product"}</span>
                    <span className="col-span-2 text-muted-foreground">{order.quantity}</span>
                    <span className="col-span-3 text-muted-foreground truncate">{order.username || "Customer"}</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
                    </span>
                    <span className="col-span-2 text-right">
                      {order.status !== "cancelled" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`${ROUTES.farmer.chats}/${order.id}`)}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerOrders;
