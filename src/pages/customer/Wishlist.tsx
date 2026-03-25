import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, ShoppingBag } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { wishlistService } from "@/services/wishlist.service";
import { ROUTES } from "@/config/routes";
import { toast } from "sonner";

const WishlistPage = () => {
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: () => wishlistService.list(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["wishlist-notifications"],
    queryFn: () => wishlistService.notifications(),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.toggle(productId),
    onSuccess: () => {
      toast.success("Wishlist updated");
      void queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      void queryClient.invalidateQueries({ queryKey: ["wishlist-notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-market-products"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to update wishlist");
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-20 md:pt-24 pb-12">
        <div className="container max-w-6xl space-y-8">
          <section className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground">Save products for later and track price drops automatically.</p>
          </section>

          <section className="rounded-2xl border border-accent/20 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-accent" />
              <h2 className="font-semibold text-foreground">Price Notifications</h2>
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No price drops yet.</p>
            ) : (
              <div className="grid gap-3">
                {notifications.map((item) => (
                  <div key={item.productId} className="rounded-xl border border-accent/20 p-3 bg-accent/5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">₹{item.previousPrice} to ₹{item.currentPrice}</p>
                    </div>
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">Saved ₹{item.dropAmount.toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading && <p className="text-muted-foreground">Loading wishlist...</p>}

            {!isLoading && wishlist.length === 0 && (
              <div className="col-span-full text-center py-16 border rounded-2xl bg-card">
                <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-foreground font-medium">No wishlist items yet.</p>
                <Button asChild className="mt-4">
                  <Link to={ROUTES.customer.market}>Browse Marketplace</Link>
                </Button>
              </div>
            )}

            {wishlist.map((item) => (
              <div key={item.productId} className="rounded-2xl border border-accent/20 bg-card p-4 space-y-3">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=500&h=320&fit=crop"}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-xl"
                />

                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category || "Uncategorized"}</p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent font-bold">₹{item.price}</span>
                  <span className="text-muted-foreground">saved at ₹{item.savedPrice}</span>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link to={`${ROUTES.customer.market}/${item.productId}`}>
                      <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => removeMutation.mutate(item.productId)}
                    disabled={removeMutation.isPending}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
