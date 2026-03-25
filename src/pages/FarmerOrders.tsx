import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck, Clock3, Truck, CircleCheckBig, Ban, MessageCircle } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { orderService } from "@/services/order.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OrderChatDialog from "@/components/chat/OrderChatDialog";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  accepted: { label: "Accepted", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  shipped: { label: "Shipped", className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  delivered: { label: "Delivered", className: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const FarmerOrders = () => {
  const [activeChatOrder, setActiveChatOrder] = useState<{
    id: number;
    productName?: string;
    partnerName?: string;
  } | null>(null);

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
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
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
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
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
                <div key={order.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0 border-border text-sm items-center">
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
                        onClick={() => setActiveChatOrder({ id: Number(order.id), productName: order.product_name, partnerName: order.username })}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <OrderChatDialog
            open={Boolean(activeChatOrder)}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setActiveChatOrder(null);
            }}
            orderId={activeChatOrder?.id ?? null}
            productName={activeChatOrder?.productName}
            fallbackPartnerName={activeChatOrder?.partnerName}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerOrders;
