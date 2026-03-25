import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Heart, ChevronLeft, ChevronRight, ShoppingCart, Minus, Plus, Eye, Filter } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";

const categories = [
  "All", "Vegetables", "Fruits", "Grains & Cereals", "Pulses & Legumes",
  "Spices", "Dairy", "Nuts & Seeds", "Organic",
];

type Quality = "Premium" | "Standard" | "Economy" | "Organic";

const qualityStyle: Record<Quality, string> = {
  Premium: "bg-primary/10 text-primary border-primary/20",
  Standard: "bg-accent/10 text-accent border-accent/20",
  Economy: "bg-[hsl(var(--action-yellow))]/10 text-[hsl(var(--action-yellow))] border-[hsl(var(--action-yellow))]/20",
  Organic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const fallbackImage = "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=400&h=300&fit=crop";
const ITEMS_PER_PAGE = 8;

const CustomerMarket = () => {
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [ecoOnly, setEcoOnly] = useState(false);
  const [seasonalOnly, setSeasonalOnly] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setUserCoords(null);
      },
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }, []);

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: () => wishlistService.list(),
  });

  useEffect(() => {
    setFavorites(new Set(wishlist.map((item) => Number(item.productId))));
  }, [wishlist]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "customer-market-products",
      activeCategory,
      search,
      minPrice,
      maxPrice,
      minRating,
      maxDistance,
      organicOnly,
      ecoOnly,
      seasonalOnly,
      userCoords?.lat,
      userCoords?.lng,
    ],
    queryFn: () =>
      productService.list({
        category: activeCategory === "All" ? undefined : activeCategory,
        search: search || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        min_rating: minRating ? Number(minRating) : undefined,
        max_distance: maxDistance ? Number(maxDistance) : undefined,
        organic: organicOnly || undefined,
        eco: ecoOnly || undefined,
        seasonal: seasonalOnly || undefined,
        user_lat: userCoords?.lat,
        user_lng: userCoords?.lng,
        page: 1,
        limit: 100,
      }),
  });

  const { data: seasonalSuggestions } = useQuery({
    queryKey: ["seasonal-suggestions-market"],
    queryFn: () => productService.getSeasonalSuggestions(6),
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) => cartService.add(productId, quantity ?? 1),
    onSuccess: () => {
      toast.success("Added to cart");
      void queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error && error.message ? error.message : "Unable to add product to cart";
      toast.error(message);
    },
  });

  const products = useMemo(() => {
    return (data?.products ?? []).map((product) => {
      const quality = (["Premium", "Standard", "Economy", "Organic"].includes(product.quality || "")
        ? product.quality
        : "Standard") as Quality;

      return {
        id: Number(product.id),
        name: product.name,
        price: Number(product.price ?? 0),
        category: product.category || "Uncategorized",
        image: product.image || fallbackImage,
        quality,
        rating: Number(product.rating ?? 0),
        farmerRating: Number(product.farmerRating ?? 0),
        distanceKm: product.distanceKm ?? null,
        isOrganic: Boolean(product.isOrganic),
        isEcoCertified: Boolean(product.isEcoCertified),
      };
    });
  }, [data?.products]);

  const filtered = products;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleFav = (id: number) => {
    if (favorites.has(id)) {
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setFavorites((prev) => new Set(prev).add(id));
    }

    wishlistToggleMutation.mutate(id);
  };

  const wishlistToggleMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.toggle(productId),
    onSuccess: (wishlisted) => {
      toast.success(wishlisted ? "Added to wishlist" : "Removed from wishlist");
      void queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      void queryClient.invalidateQueries({ queryKey: ["wishlist-notifications"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to update wishlist");
    },
  });

  const getSelectedQuantity = (productId: number) => selectedQuantities[productId] ?? 1;

  const updateSelectedQuantity = (productId: number, nextQuantity: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(99, Math.max(1, nextQuantity)),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-20 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">Discover premium produce from trusted farmers with a smoother buying experience.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="pl-10 h-12 bg-muted/50 dark:bg-muted/30 rounded-xl text-base"
              />
            </div>
          </motion.div>

          <div className="rounded-2xl border border-accent/20 bg-card p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-foreground">Advanced Filters</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} placeholder="Min price" />
              <Input value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} placeholder="Max price" />
              <Input value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(1); }} placeholder="Min rating (0-5)" />
              <Input value={maxDistance} onChange={(e) => { setMaxDistance(e.target.value); setPage(1); }} placeholder="Distance km" />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => { setOrganicOnly((prev) => !prev); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm border ${organicOnly ? "bg-accent text-accent-foreground border-accent" : "bg-background text-muted-foreground border-border"}`}
              >
                Organic Only
              </button>
              <button
                type="button"
                onClick={() => { setEcoOnly((prev) => !prev); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm border ${ecoOnly ? "bg-accent text-accent-foreground border-accent" : "bg-background text-muted-foreground border-border"}`}
              >
                Eco-certified
              </button>
              <button
                type="button"
                onClick={() => { setSeasonalOnly((prev) => !prev); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm border ${seasonalOnly ? "bg-accent text-accent-foreground border-accent" : "bg-background text-muted-foreground border-border"}`}
              >
                Seasonal picks
              </button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8 overflow-x-auto pb-2 -mx-1">
            <div className="flex gap-2 px-1 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-accent text-accent-foreground shadow-[0_10px_24px_-14px_hsl(var(--accent)/0.8)]"
                      : "bg-muted/60 dark:bg-muted/30 text-muted-foreground hover:bg-accent/10 border border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${page}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-10"
            >
              {isLoading && (
                <div className="col-span-full text-center py-10 text-muted-foreground">Loading products...</div>
              )}

              {paginated.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                  className="group relative rounded-2xl border border-accent/22 bg-card/95 shadow-sm hover:shadow-[0_20px_38px_-22px_hsl(var(--accent)/0.6)] transition-all duration-300 overflow-hidden"
                >
                  <Link to={`${ROUTES.customer.market}/${product.id}`}>
                    <div className="relative h-44 sm:h-48 overflow-hidden bg-muted/30">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <Badge variant="secondary" className="absolute top-3 left-3 text-xs font-medium">{product.category}</Badge>
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          toggleFav(product.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-card/85 backdrop-blur-sm border border-accent/15 transition-colors hover:bg-card"
                      >
                        <Heart className={`h-4 w-4 transition-colors ${favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-foreground text-base">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-accent">₹{product.price}<span className="text-xs font-normal text-muted-foreground">/kg</span></span>
                        <Badge variant="outline" className={`text-xs ${qualityStyle[product.quality]}`}>{product.quality}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Product {product.rating.toFixed(1)}★</span>
                        <span>Farmer {product.farmerRating.toFixed(1)}★</span>
                        {product.distanceKm != null && <span>{product.distanceKm} km</span>}
                      </div>
                      <div className="flex gap-2">
                        {product.isOrganic && <Badge variant="secondary">Organic</Badge>}
                        {product.isEcoCertified && <Badge variant="secondary">Eco</Badge>}
                      </div>
                    </div>
                  </Link>

                  <div className="px-4 pb-4 space-y-2.5">
                    <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/8 px-2 py-1">
                      <span className="text-xs font-medium text-muted-foreground">Qty</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-accent hover:text-accent"
                          onClick={() => updateSelectedQuantity(product.id, getSelectedQuantity(product.id) - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-6 text-center text-sm font-semibold text-accent">{getSelectedQuantity(product.id)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-accent hover:text-accent"
                          onClick={() => updateSelectedQuantity(product.id, getSelectedQuantity(product.id) + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button type="button" size="sm" variant="outline" className="rounded-lg h-10 border-accent/40 text-accent hover:bg-accent/12" asChild>
                        <Link to={`${ROUTES.customer.market}/${product.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> View Details
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg h-10"
                        onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: getSelectedQuantity(product.id) })}
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {paginated.length === 0 && !isLoading && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-9 w-9 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={page === p ? "default" : "outline"} size="icon" onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm ${page === p ? "bg-accent hover:bg-accent/90" : ""}`}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="h-9 w-9 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {(seasonalSuggestions?.suggestions?.length ?? 0) > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Seasonal Suggestions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(seasonalSuggestions?.suggestions ?? []).map((item) => (
                  <Link key={item.id} to={`${ROUTES.customer.market}/${item.id}`} className="rounded-xl border border-accent/20 bg-card p-3 hover:border-accent/40 transition-colors">
                    <img src={item.image || fallbackImage} alt={item.name} className="w-full h-32 rounded-lg object-cover mb-2" />
                    <p className="font-semibold text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">₹{item.price}/kg • {item.category}</p>
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

export default CustomerMarket;
