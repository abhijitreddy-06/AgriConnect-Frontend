import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Minus, Plus, ShoppingCart, Zap, User, Package } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import { orderService } from "@/services/order.service";
import { wishlistService } from "@/services/wishlist.service";
import { farmerReviewService } from "@/services/farmerReview.service";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Quality = "Premium" | "Standard" | "Economy" | "Organic";

const qualityStyle: Record<Quality, string> = {
  Premium: "bg-primary/10 text-primary border-primary/20",
  Standard: "bg-accent/10 text-accent border-accent/20",
  Economy: "bg-[hsl(var(--action-yellow))]/10 text-[hsl(var(--action-yellow))] border-[hsl(var(--action-yellow))]/20",
  Organic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const fallbackImage = "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=600&h=500&fit=crop";

const CustomerProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const parsedProductId = Number(productId);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reliabilityRating, setReliabilityRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState("");

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: () => wishlistService.list(),
  });

  const { data: recommendationData } = useQuery({
    queryKey: ["customer-product-recommendations", parsedProductId],
    queryFn: () => productService.getRecommendations(parsedProductId, 6),
    enabled: Number.isFinite(parsedProductId),
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["customer-product-detail", parsedProductId],
    queryFn: () => productService.getById(parsedProductId),
    enabled: Number.isFinite(parsedProductId),
  });

  const { data: relatedData } = useQuery({
    queryKey: ["customer-product-related", product?.category],
    queryFn: () => productService.list({ category: product?.category, page: 1, limit: 8 }),
    enabled: Boolean(product?.category),
  });

  const { data: farmerReviewData } = useQuery({
    queryKey: ["farmer-reviews", product?.farmerId],
    queryFn: () => farmerReviewService.getFarmerReviews(Number(product?.farmerId)),
    enabled: Boolean(product?.farmerId),
  });

  const related = useMemo(() => {
    if (!product) return [];
    return (relatedData?.products ?? [])
      .filter((item) => Number(item.id) !== Number(product.id))
      .slice(0, 4);
  }, [relatedData?.products, product]);

  const customersAlsoBought = recommendationData?.customersAlsoBought ?? [];
  const seasonalSuggestions = recommendationData?.seasonalSuggestions ?? [];

  useEffect(() => {
    const ids = new Set(wishlist.map((item) => Number(item.productId)));
    setWishlisted(ids.has(parsedProductId));
  }, [wishlist, parsedProductId]);

  useEffect(() => {
    if (user?.deliveryAddress) {
      setDeliveryAddress(user.deliveryAddress);
    }
  }, [user?.deliveryAddress]);

  const productQuality = (["Premium", "Standard", "Economy", "Organic"].includes(product?.quality || "")
    ? product?.quality
    : "Standard") as Quality;

  const addToCartMutation = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("Product not found");
      return cartService.add(Number(product.id), quantity);
    },
    onSuccess: () => {
      toast.success("Added to cart");
      void queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to add to cart");
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("Product not found");
      const trimmedAddress = deliveryAddress.trim();
      if (trimmedAddress.length > 0 && trimmedAddress.length < 10) {
        throw new Error("Delivery address must be at least 10 characters");
      }
      return orderService.create({
        product_id: Number(product.id),
        quantity,
        delivery_address: trimmedAddress.length >= 10 ? trimmedAddress : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Order placed successfully");
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-market-products"] });
      navigate(ROUTES.customer.orders);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to place order");
    },
  });

  const wishlistToggleMutation = useMutation({
    mutationFn: () => wishlistService.toggle(parsedProductId),
    onSuccess: (nextState) => {
      setWishlisted(nextState);
      toast.success(nextState ? "Added to wishlist" : "Removed from wishlist");
      void queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      void queryClient.invalidateQueries({ queryKey: ["wishlist-notifications"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to update wishlist");
    },
  });

  const farmerReviewMutation = useMutation({
    mutationFn: () => farmerReviewService.create({
      order_id: Number(reviewOrderId),
      reliability_rating: reliabilityRating,
      quality_rating: qualityRating,
      feedback: reviewFeedback || undefined,
    }),
    onSuccess: () => {
      toast.success("Farmer review submitted");
      setReviewOrderId("");
      setReviewFeedback("");
      void queryClient.invalidateQueries({ queryKey: ["farmer-reviews", product?.farmerId] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to submit farmer review");
    },
  });

  if (!Number.isFinite(parsedProductId)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 pt-20 md:pt-24 pb-12">
          <div className="container max-w-6xl">
            <p className="text-muted-foreground">Invalid product id.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 pt-20 md:pt-24 pb-12">
          <div className="container max-w-6xl">
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 pt-20 md:pt-24 pb-12">
          <div className="container max-w-6xl">
            <p className="text-muted-foreground">Product not found.</p>
            <Button asChild className="mt-4">
              <Link to={ROUTES.customer.market}>Back to marketplace</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background bg-gradient-to-br from-background via-background to-secondary/20">
      <main className="flex-1 pt-20 md:pt-24 pb-12">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link to={ROUTES.customer.home} className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={ROUTES.customer.market} className="hover:text-foreground transition-colors">Market</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 space-y-3"
            >
              <div className="relative rounded-2xl overflow-hidden border border-accent/25 bg-card aspect-square group shadow-[0_24px_48px_-30px_hsl(var(--accent)/0.8)]">
                <img
                  src={product.image || fallbackImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button
                  onClick={() => wishlistToggleMutation.mutate()}
                  className="absolute top-4 right-4 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
                >
                  <Heart className={`h-5 w-5 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-3 space-y-6"
            >
              <div className="customer-premium-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{product.category || "Uncategorized"}</Badge>
                  <Badge variant="outline" className={`text-xs ${qualityStyle[productQuality]}`}>{productQuality}</Badge>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">{product.name}</h1>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-accent">₹{product.price}</span>
                <span className="text-sm text-muted-foreground">/kg</span>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Fresh produce from verified farmers. Choose quantity and buy directly in one step.
              </p>

              <div className="customer-premium-card p-4 space-y-2">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-accent/35"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-10 text-center text-accent">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-accent/35"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="customer-premium-card p-4 space-y-2">
                <label htmlFor="buyNowAddress" className="text-sm font-medium text-foreground">Delivery Address (optional)</label>
                <Input
                  id="buyNowAddress"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Enter delivery address for Buy Now"
                />
                {user?.deliveryAddress && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeliveryAddress(user.deliveryAddress || "")}
                  >
                    Use Saved Profile Address
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="lg" className="flex-1 rounded-xl border-accent/40 text-accent hover:bg-accent/12" onClick={() => addToCartMutation.mutate()} disabled={addToCartMutation.isPending}>
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
                <Button variant="hero" size="lg" className="flex-1 rounded-xl bg-accent hover:bg-accent/90" onClick={() => buyNowMutation.mutate()} disabled={buyNowMutation.isPending}>
                  <Zap className="h-5 w-5 mr-2" /> {buyNowMutation.isPending ? "Placing..." : "Buy Now"}
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Seller Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-accent" />
                    <span>{product.farmerName || "Farmer"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-accent" />
                    <span>Available stock: {product.quantity ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Farmer rating: {Number(product.farmerRating ?? 0).toFixed(1)}★ ({product.farmerTotalReviews ?? 0})</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Rate This Farmer</h3>
                <p className="text-xs text-muted-foreground">Submit after order delivery to rate reliability and quality.</p>
                <Input value={reviewOrderId} onChange={(event) => setReviewOrderId(event.target.value)} placeholder="Delivered order ID" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={String(reliabilityRating)} onChange={(event) => setReliabilityRating(Number(event.target.value) || 1)} placeholder="Reliability (1-5)" />
                  <Input value={String(qualityRating)} onChange={(event) => setQualityRating(Number(event.target.value) || 1)} placeholder="Quality (1-5)" />
                </div>
                <Input value={reviewFeedback} onChange={(event) => setReviewFeedback(event.target.value)} placeholder="Feedback (optional)" />
                <Button
                  type="button"
                  size="sm"
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => farmerReviewMutation.mutate()}
                  disabled={farmerReviewMutation.isPending || !reviewOrderId}
                >
                  Submit Farmer Review
                </Button>
              </div>
            </motion.div>
          </div>

          {farmerReviewData && (
            <section className="mb-14">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Farmer Reviews</h2>
              <div className="rounded-2xl border border-accent/20 bg-card p-4 mb-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Overall:</span> <span className="font-semibold">{Number(farmerReviewData.averageRating || 0).toFixed(1)}★</span></div>
                <div><span className="text-muted-foreground">Reliability:</span> <span className="font-semibold">{Number(farmerReviewData.averageReliability || 0).toFixed(1)}★</span></div>
                <div><span className="text-muted-foreground">Quality:</span> <span className="font-semibold">{Number(farmerReviewData.averageQuality || 0).toFixed(1)}★</span></div>
              </div>
              <div className="space-y-3">
                {(farmerReviewData.reviews ?? []).slice(0, 4).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border p-3 bg-card/80">
                    <p className="text-sm font-semibold text-foreground">{entry.customer_name || "Customer"} • {Number(entry.rating || 0).toFixed(1)}★</p>
                    <p className="text-xs text-muted-foreground mt-1">Reliability {entry.reliability_rating}/5 • Quality {entry.quality_rating}/5</p>
                    {entry.feedback && <p className="text-sm text-foreground/90 mt-2">{entry.feedback}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-display font-bold text-foreground mb-5">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((item, i) => (
                <Link key={item.id} to={`${ROUTES.customer.market}/${item.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 overflow-hidden bg-muted/30">
                      <img src={item.image || fallbackImage} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <Badge variant="secondary" className="absolute top-3 left-3 text-xs">{item.category || "Uncategorized"}</Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-accent">₹{item.price}<span className="text-xs font-normal text-muted-foreground">/kg</span></span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {customersAlsoBought.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-display font-bold text-foreground mb-5">Customers Also Bought</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {customersAlsoBought.map((item) => (
                  <Link key={`rec-${item.id}`} to={`${ROUTES.customer.market}/${item.id}`} className="rounded-2xl border border-border bg-card p-3 hover:border-accent/30 transition-colors">
                    <img src={item.image || fallbackImage} alt={item.name} className="w-full h-32 rounded-lg object-cover mb-2" />
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price}/kg • {item.rating?.toFixed(1)}★</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {seasonalSuggestions.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-display font-bold text-foreground mb-5">Seasonal Suggestions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {seasonalSuggestions.map((item) => (
                  <Link key={`season-${item.id}`} to={`${ROUTES.customer.market}/${item.id}`} className="rounded-2xl border border-border bg-card p-3 hover:border-accent/30 transition-colors">
                    <img src={item.image || fallbackImage} alt={item.name} className="w-full h-32 rounded-lg object-cover mb-2" />
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price}/kg • {item.category}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerProductDetail;
