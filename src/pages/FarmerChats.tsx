import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { orderService } from "@/services/order.service";
import { ROUTES } from "@/config/routes";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  accepted: { label: "Accepted", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  shipped: { label: "Shipped", className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  delivered: { label: "Delivered", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const FarmerChats = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: ordersResponse, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["farmer-chat-orders"],
    queryFn: () => orderService.list({ page: 1, limit: 100 }),
  });

  const orders = ordersResponse?.orders ?? [];

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) => {
      const productName = String(order.product_name || "").toLowerCase();
      const customerName = String(order.username || "").toLowerCase();
      return productName.includes(term) || customerName.includes(term) || String(order.id).includes(term);
    });
  }, [orders, search]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-5xl space-y-6">
          <section>
            <h1 className="text-3xl font-display font-bold text-foreground">Chats</h1>
            <p className="text-muted-foreground mt-1">Open any conversation to continue in a dedicated chat screen.</p>
          </section>

          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by product or customer"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="p-2 space-y-2 max-h-[68vh] overflow-y-auto">
              {isLoadingOrders && <p className="px-2 py-4 text-sm text-muted-foreground">Loading conversations...</p>}

              {!isLoadingOrders && filteredOrders.length === 0 && (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">No order chats found.</div>
              )}

              {filteredOrders.map((order) => {
                const status = statusMap[order.status] ?? {
                  label: order.status,
                  className: "bg-muted text-muted-foreground border-border",
                };

                return (
                  <button
                    type="button"
                    key={order.id}
                    onClick={() => navigate(`${ROUTES.farmer.chats}/${order.id}`)}
                    className="w-full text-left rounded-xl border border-border bg-background hover:bg-muted/40 px-3 py-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-foreground truncate inline-flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        {order.product_name || "Product"}
                      </p>
                      <Badge variant="outline" className={`${status.className} text-[10px]`}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">Customer: {order.username || "Customer"}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Order #{order.id}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerChats;