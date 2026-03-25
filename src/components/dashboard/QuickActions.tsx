import { motion } from "framer-motion";
import { Plus, Bot, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "Add Product" },
  { icon: Bot, label: "Diagnose Crop" },
  { icon: Package, label: "View Orders" },
];

const QuickActions = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.5 }}
  >
    <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Actions</h2>
    <div className="flex flex-wrap gap-3">
      {actions.map(({ icon: Icon, label }) => (
        <Button
          key={label}
          variant="hero"
          size="lg"
          className="gap-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
        >
          <Icon className="h-5 w-5" />
          {label}
        </Button>
      ))}
    </div>
  </motion.div>
);

export default QuickActions;
