import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
  accentClass: string;
  borderClass: string;
  delay?: number;
}

const RoleCard = ({ icon: Icon, title, description, cta, href, accentClass, borderClass, delay = 0 }: RoleCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      onClick={() => navigate(href)}
      className={`group relative cursor-pointer rounded-2xl bg-card border-2 border-border p-8 md:p-10 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col ${borderClass}`}
    >
      <div className={`inline-flex items-center justify-center h-14 w-14 rounded-xl mb-6 ${accentClass}`}>
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="font-display font-bold text-2xl text-card-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>

      <Button variant="hero" size="lg" className="w-full mt-auto">
        {cta}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </motion.div>
  );
};

export default RoleCard;
