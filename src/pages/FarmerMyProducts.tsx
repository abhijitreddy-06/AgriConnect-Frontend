import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Package, ShoppingCart, AlertTriangle, IndianRupee,
  Eye, Pencil, Trash2, Filter, X
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/landing/Footer";
import StatsCard from "@/components/dashboard/StatsCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/product.service";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const fallbackImage = "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=400&h=300&fit=crop";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: "Active" | "Out of stock";
  image: string;
}

const FarmerMyProducts = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["farmer-my-products", user?.id],
    queryFn: () => productService.list({ farmer_id: user?.id, limit: 100 }),
    enabled: Boolean(user?.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: () => {
      toast.success("Product removed successfully");
      void queryClient.invalidateQueries({ queryKey: ["farmer-my-products"] });
      void queryClient.invalidateQueries({ queryKey: ["farmer-market-products"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error && error.message ? error.message : "Failed to delete product";
      toast.error(message);
    },
  });

  const products: Product[] = (data?.products ?? []).map((product) => {
    const stock = Number(product.quantity ?? 0);
    return {
      id: Number(product.id),
      name: product.name,
      price: Number(product.price ?? 0),
      category: product.category || "Uncategorized",
      stock,
      status: stock > 0 ? "Active" : "Out of stock",
      image: product.image || fallbackImage,
    };
  });

  const totalProducts = products.length;
  const activeListings = products.filter((product) => product.status === "Active").length;
  const outOfStock = products.filter((product) => product.status === "Out of stock").length;
  const estimatedInventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  const stats = [
    { icon: Package, label: "Total Products", value: String(totalProducts), trend: "All listed products", trendUp: true, tooltip: "All listed products" },
    { icon: ShoppingCart, label: "Active Listings", value: String(activeListings), trend: "Currently available", trendUp: true, tooltip: "Currently available" },
    { icon: AlertTriangle, label: "Out of Stock", value: String(outOfStock), trend: "Needs restock", trendUp: false, tooltip: "Unavailable items" },
    { icon: IndianRupee, label: "Inventory Value", value: `₹${estimatedInventoryValue.toLocaleString()}`, trend: "Estimated by stock x price", trendUp: true, tooltip: "Inventory value" },
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category === category;
      const matchStatus = status === "All" || p.status === status;
      return matchSearch && matchCat && matchStatus;
    });
  }, [search, category, status, products]);

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">My Products</h1>
            <p className="text-muted-foreground mt-1">Manage and update your listed products</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <StatsCard key={s.label} {...s} index={i} />
            ))}
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-44 bg-muted/50">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {["All", "Vegetables", "Fruits", "Grains & Cereals", "Spices", "Dairy", "Organic"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-40 bg-muted/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Out of stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Product Grid */}
          <AnimatePresence mode="popLayout">
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-muted-foreground">
                Loading your products...
              </motion.div>
            )}
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display font-semibold text-xl text-foreground">No products found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or add a new product.</p>
                <Button variant="default" className="mt-6" asChild>
                  <Link to={ROUTES.farmer.sell}>Add Product</Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={{ y: -6, boxShadow: "0 16px 32px -8px hsl(var(--primary) / 0.12)" }}
                    className="group bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <Badge
                        className={`absolute top-3 left-3 text-[10px] ${
                          p.status === "Active"
                            ? "bg-primary/90 text-primary-foreground"
                            : "bg-destructive/90 text-destructive-foreground"
                        }`}
                      >
                        {p.status}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground truncate">{p.name}</h4>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-primary">₹{p.price}</span>
                        <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent-foreground">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive ml-auto"
                              onClick={() => setDeleteTarget(p)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FarmerMyProducts;
