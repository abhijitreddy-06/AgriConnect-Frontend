import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageCheck, Clock3, Truck, CircleCheckBig, Ban, MessageCircle } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { orderService } from "@/services/order.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OrderChatDialog from "@/components/chat/OrderChatDialog";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  accepted: { label: "Accepted", className: "bg-primary/10 text-primary border-primary/25" },
  shipped: { label: "Shipped", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  delivered: { label: "Delivered", className: "bg-accent/10 text-accent border-accent/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Orders = () => {
  const queryClient = useQueryClient();
  const [activeChatOrder, setActiveChatOrder] = useState<{
    id: number;
    productName?: string;
    partnerName?: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: () => orderService.list({ page: 1, limit: 100 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: number | string) => orderService.cancel(orderId),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-market-products"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to cancel order");
    },
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
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-20 md:pt-24 pb-16">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-1">Track your purchases and order status.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="customer-premium-card p-4">
              <PackageCheck className="h-5 w-5 text-accent mb-2" />
              <p className="text-2xl font-display font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
            <div className="customer-premium-card p-4">
              <Clock3 className="h-5 w-5 text-amber-600 mb-2" />
              <p className="text-2xl font-display font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="customer-premium-card p-4">
              <Truck className="h-5 w-5 text-orange-600 mb-2" />
              <p className="text-2xl font-display font-bold">{stats.shipped}</p>
              <p className="text-xs text-muted-foreground">Shipped</p>
            </div>
            <div className="customer-premium-card p-4">
              <CircleCheckBig className="h-5 w-5 text-accent mb-2" />
              <p className="text-2xl font-display font-bold">{stats.delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>

          <div className="customer-premium-card overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <span className="col-span-4">Product</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-2">Total</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2 text-right">Action</span>
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
              const canCancel = ["pending", "accepted"].includes(order.status);

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
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-foreground">₹{Number(order.total_price ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        {order.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => setActiveChatOrder({ id: Number(order.id), productName: order.product_name, partnerName: order.username })}
                          >
                            <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
                          </Button>
                        )}
                        {canCancel ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10 whitespace-nowrap"
                            onClick={() => cancelMutation.mutate(order.id)}
                            disabled={cancelMutation.isPending}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-12 gap-2 text-sm items-center">
                    <span className="col-span-4 font-medium text-foreground truncate">{order.product_name || "Product"}</span>
                    <span className="col-span-2 text-muted-foreground">{order.quantity}</span>
                    <span className="col-span-2 text-muted-foreground">₹{Number(order.total_price ?? 0).toFixed(2)}</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
                    </span>
                    <span className="col-span-2 text-right space-x-2">
                      {order.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveChatOrder({ id: Number(order.id), productName: order.product_name, partnerName: order.username })}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
                        </Button>
                      )}
                      {canCancel ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => cancelMutation.mutate(order.id)}
                          disabled={cancelMutation.isPending}
                        >
                          Cancel
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

export default Orders;
