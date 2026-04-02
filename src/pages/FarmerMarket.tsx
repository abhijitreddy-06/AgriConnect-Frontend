import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";

const categories = [
  "All", "Vegetables", "Fruits", "Grains & Cereals", "Pulses & Legumes",
  "Spices", "Dairy", "Nuts & Seeds", "Organic",
];

type Quality = "Premium" | "Standard" | "Economy" | "Organic";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  quality: Quality;
  image: string;
  owned: boolean;
}

const qualityColor: Record<Quality, string> = {
  Premium: "bg-primary/10 text-primary border-primary/20",
  Standard: "bg-accent/10 text-accent border-accent/20",
  Economy: "bg-[hsl(var(--action-yellow))]/10 text-[hsl(var(--action-yellow))] border-[hsl(var(--action-yellow))]/20",
  Organic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const fallbackImage = "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=400&h=300&fit=crop";

const ITEMS_PER_PAGE = 12;

const FarmerMarket = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["farmer-market-products", activeCategory, search],
    queryFn: () =>
      productService.list({
        category: activeCategory === "All" ? undefined : activeCategory,
        search: search || undefined,
        page: 1,
        limit: 100,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: () => {
      toast.success("Product removed successfully");
      void queryClient.invalidateQueries({ queryKey: ["farmer-market-products"] });
      void queryClient.invalidateQueries({ queryKey: ["farmer-my-products"] });
    },
    onError: (error: unknown) => {
      const rawMessage = error instanceof Error && error.message ? error.message : "Failed to remove product";
      const message = rawMessage.toLowerCase().includes("cold start") || rawMessage.toLowerCase().includes("unable to reach server")
        ? "Server is waking up. Please retry delete in 15-30 seconds."
        : rawMessage;
      toast.error(message);
    },
  });

  const currentUserId = Number(user?.id);
  const products: Product[] = (data?.products ?? []).map((product) => {
    const quality = (product.quality as Quality) || "Standard";
    return {
      id: Number(product.id),
      name: product.name,
      price: Number(product.price ?? 0),
      category: product.category || "Uncategorized",
      quality: ["Premium", "Standard", "Economy", "Organic"].includes(quality) ? quality : "Standard",
      image: product.image || fallbackImage,
      owned: Number(product.farmerId) === currentUserId,
    };
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleFav = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const pageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background bg-gradient-to-br from-background via-background to-secondary/20">
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Farmer Bazaar</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              One of India's largest marketplace to BUY, SELL & RENT agriculture products
            </p>
          </motion.div>

          {/* Search */}
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

          {/* Category Tabs */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8 overflow-x-auto pb-2 -mx-1">
            <div className="flex gap-2 px-1 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 dark:bg-muted/30 text-muted-foreground hover:bg-muted border border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${page}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-10"
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
                  className="group relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <Link to={`${ROUTES.farmer.market}/${product.id}`}>
                  <div className="relative h-48 overflow-hidden bg-muted/30">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Category Badge */}
                    <Badge variant="secondary" className="absolute top-3 left-3 text-xs font-medium">
                      {product.category}
                    </Badge>
                    {/* Favorite */}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFav(product.id); }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border transition-colors hover:bg-card"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-foreground text-base leading-tight">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₹{product.price}<span className="text-xs font-normal text-muted-foreground">/kg</span></span>
                      <Badge variant="outline" className={`text-xs ${qualityColor[product.quality]}`}>
                        {product.quality}
                      </Badge>
                    </div>
                  </div>
                  </Link>

                  {product.owned && (
                    <div className="px-4 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="w-full justify-center px-3 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty state */}
          {paginated.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-9 w-9 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers().map((p, i) =>
                typeof p === "string" ? (
                  <span key={`e${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 rounded-lg text-sm ${page === p ? "" : ""}`}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="h-9 w-9 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerMarket;
