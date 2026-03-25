import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cartService } from "@/services/cart.service";
import { toast } from "sonner";

const Cart = () => {
  const queryClient = useQueryClient();
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customer-cart"],
    queryFn: () => cartService.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) =>
      cartService.update(cartItemId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to update item");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (cartItemId: number) => cartService.remove(cartItemId),
    onSuccess: () => {
      toast.success("Item removed from cart");
      void queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove item");
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: () => {
      toast.success("Cart cleared");
      void queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to clear cart");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => cartService.checkout(deliveryAddress || undefined),
    onSuccess: (payload) => {
      const count = payload.data?.orderIds?.length ?? 0;
      toast.success(count > 0 ? `${count} order(s) placed successfully` : "Checkout completed");
      if (payload.data?.warnings?.length) {
        toast.warning(payload.data.warnings[0]);
      }
      setDeliveryAddress("");
      void queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-market-products"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    },
  });

  const items = data?.items ?? [];
  const cartTotal = data?.cartTotal ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-20 md:pt-24 pb-16">
        <div className="container max-w-5xl">
          <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-foreground">Cart</h1>
          <p className="text-muted-foreground mt-2">Review items before checkout.</p>

          {isLoading && <p className="text-muted-foreground mt-8">Loading cart...</p>}

          {!isLoading && items.length === 0 && (
            <div className="mt-8 customer-premium-card p-8 text-center">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add products from the marketplace.</p>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-8 grid lg:grid-cols-[1fr_340px] gap-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="customer-premium-card p-4 flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=200&h=200&fit=crop"}
                      alt={item.product_name}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">Farmer: {item.farmer_name || "Unknown"}</p>
                      <p className="text-sm font-medium text-accent mt-1">₹{Number(item.price).toFixed(2)} / unit</p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-1 rounded-lg border border-accent/25 bg-accent/5 p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateMutation.mutate({ cartItemId: item.id, quantity: Math.max(1, Number(item.quantity) - 1) })}
                          disabled={updateMutation.isPending}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold text-accent">{Number(item.quantity)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateMutation.mutate({ cartItemId: item.id, quantity: Number(item.quantity) + 1 })}
                          disabled={updateMutation.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">₹{Number(item.subtotal).toFixed(2)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMutation.mutate(item.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="customer-premium-card p-5 h-fit lg:sticky lg:top-24 space-y-4">
                <h2 className="font-display font-semibold text-lg text-foreground">Order Summary</h2>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium text-foreground">{items.length}</span>
                </div>
                <div className="flex justify-between text-base border-t border-border pt-3">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-accent">₹{Number(cartTotal).toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="deliveryAddress" className="text-sm font-medium text-foreground">Delivery Address</label>
                  <Input
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Enter delivery address"
                  />
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => checkoutMutation.mutate()} disabled={checkoutMutation.isPending}>
                  {checkoutMutation.isPending ? "Placing Order..." : "Proceed to Checkout"}
                </Button>

                <Button variant="outline" className="w-full" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
