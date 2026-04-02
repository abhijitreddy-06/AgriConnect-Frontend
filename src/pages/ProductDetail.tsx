import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Minus, Plus, ShoppingCart, User, Package } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productService } from "@/services/product.service";
import { ROUTES } from "@/config/routes";

type Quality = "Premium" | "Standard" | "Economy" | "Organic";

const qualityStyle: Record<Quality, string> = {
  Premium: "bg-primary/10 text-primary border-primary/20",
  Standard: "bg-accent/10 text-accent border-accent/20",
  Economy: "bg-[hsl(var(--action-yellow))]/10 text-[hsl(var(--action-yellow))] border-[hsl(var(--action-yellow))]/20",
  Organic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const fallbackImage = "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=600&h=500&fit=crop";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const parsedProductId = Number(productId);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["market-product-detail", parsedProductId],
    queryFn: () => productService.getById(parsedProductId),
    enabled: Number.isFinite(parsedProductId),
  });

  const { data: relatedData } = useQuery({
    queryKey: ["farmer-product-related", product?.category],
    queryFn: () => productService.list({ category: product?.category, page: 1, limit: 8 }),
    enabled: Boolean(product?.category),
  });

  const related = useMemo(() => {
    if (!product) return [];
    return (relatedData?.products ?? [])
      .filter((item) => Number(item.id) !== Number(product.id))
      .slice(0, 4);
  }, [relatedData?.products, product]);

  if (!Number.isFinite(parsedProductId)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 pt-24 pb-12">
          <div className="container max-w-6xl px-6">
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
        <main className="flex-1 pt-24 pb-12">
          <div className="container max-w-6xl px-6">
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
        <main className="flex-1 pt-24 pb-12">
          <div className="container max-w-6xl px-6">
            <p className="text-muted-foreground">Product not found.</p>
            <Button asChild className="mt-4">
              <Link to={ROUTES.farmer.market}>Back to marketplace</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const productQuality = (["Premium", "Standard", "Economy", "Organic"].includes(product.quality || "")
    ? product.quality
    : "Standard") as Quality;

  return (
    <div className="min-h-screen flex flex-col bg-background bg-gradient-to-br from-background via-background to-secondary/20">
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-6xl px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link to={ROUTES.farmer.home} className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={ROUTES.farmer.market} className="hover:text-foreground transition-colors">Market</Link>
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
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card aspect-square group">
                <img
                  src={product.image || fallbackImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button
                  onClick={() => setWishlisted(!wishlisted)}
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
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{product.category || "Uncategorized"}</Badge>
                  <Badge variant="outline" className={`text-xs ${qualityStyle[productQuality]}`}>{productQuality}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{product.name}</h1>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                <span className="text-sm text-muted-foreground">/kg</span>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Fresh farm produce listed by verified sellers on AgriConnect marketplace.
              </p>

              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Quantity (kg)</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-10 text-center text-foreground">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="hero" size="lg" className="flex-1 rounded-xl h-14 text-base">
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Seller Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>{product.farmerName || "Farmer"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span>Available stock: {product.quantity ?? 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-display font-bold text-foreground mb-5">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((item, i) => (
                <Link key={item.id} to={`${ROUTES.farmer.market}/${item.id}`}>
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
                        <span className="text-base font-bold text-primary">₹{item.price}<span className="text-xs font-normal text-muted-foreground">/kg</span></span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
