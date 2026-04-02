import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  tooltip: string;
  index: number;
}

const StatsCard = ({ icon: Icon, label, value, trend, trendUp, tooltip, index }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px hsl(var(--primary) / 0.15)" }}
    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold font-display text-card-foreground break-words">{value}</p>
        <p className={`text-xs font-semibold ${trendUp ? "text-primary" : "text-destructive"}`}>
          {trend}
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-xl bg-secondary p-3 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  </motion.div>
);

export default StatsCard;
