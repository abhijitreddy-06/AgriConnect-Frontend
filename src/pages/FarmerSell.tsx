import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, IndianRupee, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/sell/ImageUpload";
import LivePreviewCard from "@/components/sell/LivePreviewCard";
import { toast } from "sonner";
import { productService } from "@/services/product.service";

const categories = ["Vegetables", "Fruits", "Grains", "Dairy", "Others"];
const units = ["Kilograms", "Grams"];

const steps = [
  { num: 1, label: "Basic Info" },
  { num: 2, label: "Pricing" },
  { num: 3, label: "Images" },
  { num: 4, label: "Details" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const FarmerSell = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Kilograms");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [contactPhone, setContactPhone] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      productService.create({
        product_name: name.trim(),
        price: Number(price),
        quantity: Number(quantity),
        quality: "Standard",
        description: description.trim(),
        quantity_unit: unit,
        category,
        productImage: imageFiles[0],
      }),
    onSuccess: () => {
      toast.success("Product listed successfully!");
      setName("");
      setPrice("");
      setQuantity("");
      setCategory("");
      setDescription("");
      setImages([]);
      setImageFiles([]);
      setContactPhone("");
      void queryClient.invalidateQueries({ queryKey: ["farmer-market-products"] });
      void queryClient.invalidateQueries({ queryKey: ["farmer-my-products"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error && error.message ? error.message : "Failed to list product";
      toast.error(message);
    },
  });

  const validateForm = () => {
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (!name.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!category) {
      toast.error("Please select a category");
      return false;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 1 || parsedPrice > 20000) {
      toast.error("Price must be between 1 and 20000");
      return false;
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 2000) {
      toast.error("Quantity must be between 1 and 2000");
      return false;
    }

    if (!/^\d{10}$/.test(contactPhone)) {
      toast.error("Contact number must be exactly 10 digits");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background bg-gradient-to-br from-background via-background to-secondary/20">
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-6xl px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Sell Farm Products
            </h1>
            <p className="text-muted-foreground mt-2">List your produce and reach customers directly</p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-2 mb-8 overflow-x-auto pb-2"
          >
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {step.num}
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-6 h-0.5 bg-border hidden sm:block" />
                )}
              </div>
            ))}
          </motion.div>

          {/* Main Layout: Form + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form Sections */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              {/* Section 1: Basic Info */}
              <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
                <Card className="rounded-2xl shadow-sm border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="font-display font-semibold text-foreground">Product Basic Info</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Organic Tomatoes"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-muted/50 dark:bg-muted/30 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="bg-muted/50 dark:bg-muted/30 rounded-xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Section 2: Pricing & Quantity */}
              <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
                <Card className="rounded-2xl shadow-sm border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IndianRupee className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="font-display font-semibold text-foreground">Pricing & Quantity</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <IndianRupee className="h-4 w-4" />
                          </span>
                          <Input
                            placeholder="0.00"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min={1}
                            max={20000}
                            className="pl-9 bg-muted/50 dark:bg-muted/30 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 100"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          min={1}
                          max={2000}
                          className="bg-muted/50 dark:bg-muted/30 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Unit</Label>
                        <Select value={unit} onValueChange={setUnit}>
                          <SelectTrigger className="bg-muted/50 dark:bg-muted/30 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Section 3: Images */}
              <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
                <Card className="rounded-2xl shadow-sm border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="font-display font-semibold text-foreground">Product Images</h2>
                    </div>
                    <ImageUpload images={images} onChange={setImages} onFilesChange={setImageFiles} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Section 4: Description & Contact */}
              <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
                <Card className="rounded-2xl shadow-sm border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="font-display font-semibold text-foreground">Details & Contact</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea
                          id="desc"
                          placeholder="Describe your product…"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-muted/50 dark:bg-muted/30 rounded-xl min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Contact Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="Enter 10-digit phone number"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            inputMode="numeric"
                            maxLength={10}
                            className="pl-9 bg-muted/50 dark:bg-muted/30 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit */}
              <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={createMutation.isPending}
                  className="w-full rounded-xl text-base"
                >
                  {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "List Product →"}
                </Button>
              </motion.div>
            </form>

            {/* Live Preview */}
            <div className="lg:col-span-2 hidden lg:block">
              <LivePreviewCard
                name={name}
                price={price}
                category={category}
                image={images[0] || null}
                description={description}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerSell;
