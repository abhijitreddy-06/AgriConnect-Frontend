import { motion } from "framer-motion";
import { Package, IndianRupee, Tag } from "lucide-react";

interface LivePreviewProps {
  name: string;
  price: string;
  category: string;
  image: string | null;
  description: string;
}

const LivePreviewCard = ({ name, price, category, image, description }: LivePreviewProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="sticky top-28"
  >
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      Live Preview
    </h3>
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
      {/* Image */}
      <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground/30" />
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <h4 className="font-display font-semibold text-lg text-foreground truncate">
          {name || "Product Name"}
        </h4>

        <div className="flex items-center gap-1 text-primary font-bold text-xl">
          <IndianRupee className="h-5 w-5" />
          {price || "0.00"}
        </div>

        {category && (
          <div className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium">
            <Tag className="h-3 w-3" />
            {category}
          </div>
        )}

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

export default LivePreviewCard;
